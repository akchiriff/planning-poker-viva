import { useState, useRef, useCallback, useEffect } from "react";
import Ably from "ably";

const SCALES = {
  fibonacci: {
    name: "Fibonacci",
    icon: "馃寑",
    desc: "1 路 2 路 3 路 5 路 8 路 13 路 21",
    cards: [
      { id:"1",   label:"1",  value:1,   special:false },
      { id:"2",   label:"2",  value:2,   special:false },
      { id:"3",   label:"3",  value:3,   special:false },
      { id:"5",   label:"5",  value:5,   special:false },
      { id:"8",   label:"8",  value:8,   special:false },
      { id:"13",  label:"13", value:13,  special:false },
      { id:"21",  label:"21", value:21,  special:false },
      { id:"inf", label:"鈭?,  value:999, special:true  },
      { id:"cof", label:"鈽?, value:-1,  special:true  },
    ]
  },
  tshirt: {
    name: "T-Shirt",
    icon: "馃憰",
    desc: "XS 路 S 路 M 路 L 路 XL 路 XXL",
    cards: [
      { id:"xs",  label:"XS",  value:1,   special:false },
      { id:"s",   label:"S",   value:2,   special:false },
      { id:"m",   label:"M",   value:3,   special:false },
      { id:"l",   label:"L",   value:5,   special:false },
      { id:"xl",  label:"XL",  value:8,   special:false },
      { id:"xxl", label:"XXL", value:13,  special:false },
      { id:"inf", label:"鈭?,   value:999, special:true  },
      { id:"cof", label:"鈽?,  value:-1,  special:true  },
    ]
  },
  powers: {
    name: "Potencias 脳2",
    icon: "鈿?,
    desc: "1 路 2 路 4 路 8 路 16 路 32",
    cards: [
      { id:"1",  label:"1",  value:1,   special:false },
      { id:"2",  label:"2",  value:2,   special:false },
      { id:"4",  label:"4",  value:4,   special:false },
      { id:"8",  label:"8",  value:8,   special:false },
      { id:"16", label:"16", value:16,  special:false },
      { id:"32", label:"32", value:32,  special:false },
      { id:"inf",label:"鈭?,  value:999, special:true  },
      { id:"cof",label:"鈽?, value:-1,  special:true  },
    ]
  }
};

const ABLY_KEY = "WmJ1Mw.fFg2Pw:cipRdirvvZ-RC9WVvfrtARistmTFTzvglM5ISPOASfQ";

function getRoomFromURL() { return new URLSearchParams(window.location.search).get("room"); }
function setRoomInURL(c) { const u=new URL(window.location.href); u.searchParams.set("room",c); window.history.replaceState({},""  ,u.toString()); }
function generateCode() { const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join(""); }
function uid() { return Math.random().toString(36).slice(2,10); }

const T = {
  cream:"#F5F0E8", paper:"#FDFAF4", ink:"#1a1a2e", inkMid:"#4A4A6A",
  inkLight:"#9090B0", sand:"#C4B89A", accent:"#2D6A4F", accentL:"#52B788",
  red:"#BC4749", gold:"#E9C46A", border:"#DDD5C0", shadow:"rgba(26,26,46,0.08)",
};

// 鈹€鈹€鈹€ ScaleSwitcher 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function ScaleSwitcher({ current, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:"flex", alignItems:"center", gap:8,
        background:T.paper, border:`1.5px solid ${T.border}`, borderRadius:40,
        padding:"8px 16px 8px 12px", cursor:"pointer", fontSize:13,
        fontFamily:"'DM Sans',sans-serif", color:T.inkMid,
        boxShadow:`0 2px 8px ${T.shadow}`, transition:"all .2s",
      }}>
        <span style={{fontSize:16}}>鈿欙笍</span>
        <span style={{fontWeight:600}}>{SCALES[current].name}</span>
        <span style={{fontSize:10,opacity:.6}}>{open?"鈻?:"鈻?}</span>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:100,
          background:T.paper, border:`1.5px solid ${T.border}`, borderRadius:16,
          overflow:"hidden", minWidth:230, boxShadow:`0 12px 40px ${T.shadow}`,
        }}>
          {Object.keys(SCALES).map(k=>(
            <button key={k} onClick={()=>{onChange(k);setOpen(false);}} style={{
              display:"flex", alignItems:"center", gap:12, width:"100%",
              padding:"14px 18px", background:k===current?"#EEF7F2":T.paper,
              border:"none", borderBottom:`1px solid ${T.border}`,
              cursor:"pointer", textAlign:"left", transition:"background .15s",
            }}>
              <span style={{fontSize:22}}>{SCALES[k].icon}</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:k===current?T.accent:T.ink,fontFamily:"'DM Sans',sans-serif"}}>{SCALES[k].name}</div>
                <div style={{fontSize:11,color:T.inkLight,marginTop:1}}>{SCALES[k].desc}</div>
              </div>
              {k===current && <span style={{marginLeft:"auto",color:T.accent,fontWeight:700}}>鉁?/span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 鈹€鈹€鈹€ PokerCard 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function PokerCard({ card, selected, onClick }) {
  const isCoffee = card.id==="cof";
  const isInf    = card.id==="inf";
  const accentBg = isCoffee?"#3D1A08":(isInf?"#0D2137":T.accent);
  const accentBd = isCoffee?"#8B4513":(isInf?"#2980B9":T.accentL);
  const fs = card.label.length>2 ? 20 : 28;

  return (
    <button onClick={onClick} style={{
      width:80, height:112, borderRadius:10, flexShrink:0,
      background: selected ? accentBg : T.paper,
      border: selected ? `2.5px solid ${accentBd}` : `1.5px solid ${T.border}`,
      cursor:"pointer", position:"relative",
      transition:"all 0.22s cubic-bezier(.34,1.56,.64,1)",
      transform: selected ? "translateY(-14px) scale(1.08)" : "translateY(0) scale(1)",
      boxShadow: selected
        ? `0 20px 48px rgba(0,0,0,0.2), 0 4px 0 ${accentBg}`
        : `0 4px 12px ${T.shadow}, 0 1px 0 ${T.border}`,
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", fontFamily:"'Playfair Display',serif",
    }}>
      <span style={{position:"absolute",top:5,left:7,fontSize:9,color:selected?"rgba(255,255,255,0.5)":T.sand,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{card.label}</span>
      <span style={{position:"absolute",bottom:5,right:7,fontSize:9,color:selected?"rgba(255,255,255,0.5)":T.sand,fontFamily:"'DM Sans',sans-serif",fontWeight:600,transform:"rotate(180deg)"}}>{card.label}</span>
      <span style={{
        fontSize: isCoffee||isInf ? 32 : fs, fontWeight: isCoffee||isInf ? 400 : 900, lineHeight:1,
        color: selected?"#fff":(isCoffee?"#3D1A08":(isInf?"#1a4a6e":T.ink)),
        textShadow: selected?"0 2px 8px rgba(0,0,0,0.2)":"none",
      }}>
        {isCoffee?"鈽?:card.label}
      </span>
      {!isCoffee&&!isInf&&(
        <span style={{fontSize:8,color:selected?"rgba(255,255,255,0.4)":T.sand,marginTop:3}}>鈾?/span>
      )}
    </button>
  );
}

// 鈹€鈹€鈹€ PlayerCard (on felt table) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function PlayerCard({ player, revealed, scaleKey, isMe, onKick, isObserver }) {
  const cards = SCALES[scaleKey]?.cards||SCALES.fibonacci.cards;
  const card  = player.vote ? cards.find(c=>c.id===player.vote) : null;
  const isCoffee = card?.id==="cof";
  const isInf    = card?.id==="inf";
  const cardBg = isCoffee?"#3D1A08":(isInf?"#0D2137":T.accent);
  const cardBd = isCoffee?"#8B4513":(isInf?"#2980B9":T.accentL);

  return (
    <div style={{position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:8,minWidth:80}}>
      {!isMe && onKick && !isObserver && (
        <button onClick={onKick} style={{
          position:"absolute",top:-6,right:-6,zIndex:10,
          width:20,height:20,borderRadius:"50%",
          background:T.red,border:"2px solid #fff",color:"#fff",
          fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",
          justifyContent:"center",boxShadow:"0 2px 6px rgba(0,0,0,0.2)",
          fontFamily:"'DM Sans',sans-serif",
        }}>鉁?/button>
      )}
      <div style={{
        width:54,height:76,borderRadius:8,
        background: isObserver?"#EEF2FF":(player.vote?(revealed?cardBg:T.inkMid):T.cream),
        border:`1.5px solid ${isObserver?"#C7D2FE":(player.vote?(revealed?cardBd:T.inkMid):T.border)}`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:revealed&&card?(card.label.length>2?14:20):18,
        color:isObserver?"#6366F1":(revealed&&card?"#fff":"rgba(255,255,255,0.2)"),
        fontFamily:"'Playfair Display',serif",fontWeight:900,
        boxShadow:"0 4px 12px rgba(0,0,0,0.2)",transition:"all 0.4s",
        backgroundImage:!isObserver&&player.vote&&!revealed
          ?"repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,0.03) 4px,rgba(255,255,255,0.03) 8px)"
          :"none",
      }}>
        {isObserver?"馃憗锔?:(revealed&&card?(isCoffee?"鈽?:card.label):(player.vote?"?":""))}
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:10,fontWeight:600,color:isMe?"#fff":(isObserver?"#C7D2FE":"rgba(255,255,255,0.85)"),fontFamily:"'DM Sans',sans-serif",maxWidth:72,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          {player.name}{isMe?" (t煤)":""}
        </div>
        <div style={{fontSize:9,color:isObserver?"#A5B4FC":(player.vote?(revealed?"rgba(255,255,255,0.7)":"#86efac"):"rgba(255,255,255,0.3)"),marginTop:1,fontFamily:"'DM Sans',sans-serif"}}>
          {isObserver?"observa":(player.vote?(revealed?(card?.label||"?"):"listo"):"pensando")}
        </div>
      </div>
    </div>
  );
}

// 鈹€鈹€鈹€ CopyBtn 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function CopyBtn({ text, label="Copiar" }) {
  const [ok,setOk]=useState(false);
  return (
    <button onClick={()=>{navigator.clipboard.writeText(text);setOk(true);setTimeout(()=>setOk(false),2000);}} style={{
      background:ok?"#EEF7F2":T.paper,border:`1.5px solid ${ok?T.accentL:T.border}`,
      borderRadius:8,padding:"8px 14px",color:ok?T.accent:T.inkMid,
      cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",
      fontWeight:600,flexShrink:0,transition:"all .2s",
    }}>{ok?"鉁?Copiado":label}</button>
  );
}

// 鈹€鈹€鈹€ Toggle 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function Toggle({ checked, onChange, label, sub }) {
  return (
    <div onClick={()=>onChange(!checked)} style={{
      display:"flex",alignItems:"center",gap:12,cursor:"pointer",
      background:checked?"#EEF2FF":T.cream,
      border:`1.5px solid ${checked?"#A5B4FC":T.border}`,
      borderRadius:12,padding:"12px 16px",transition:"all .2s",
    }}>
      <div style={{width:40,height:22,borderRadius:11,position:"relative",background:checked?"#6366F1":T.border,transition:"background .2s",flexShrink:0}}>
        <div style={{position:"absolute",top:3,left:checked?21:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
      </div>
      <div>
        <div style={{fontWeight:600,fontSize:13,color:checked?"#4F46E5":T.inkMid,fontFamily:"'DM Sans',sans-serif"}}>{label}</div>
        {sub&&<div style={{fontSize:11,color:T.inkLight,marginTop:1,fontFamily:"'DM Sans',sans-serif"}}>{sub}</div>}
      </div>
    </div>
  );
}

// 鈹€鈹€鈹€ App 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

function launchConfetti() {
  const colors = ["#2D6A4F","#52B788","#E9C46A","#BC4749","#FDFAF4","#1a1a2e"];
  const count = 120;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const size = Math.random() * 10 + 6;
    el.style.cssText = `
      position:fixed; z-index:9999; pointer-events:none;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>0.5?"50%":"2px"};
      left:${Math.random()*100}vw;
      top:-20px;
      opacity:1;
      transform:rotate(${Math.random()*360}deg);
    `;
    document.body.appendChild(el);
    const duration = 2000 + Math.random() * 1500;
    const drift = (Math.random() - 0.5) * 200;
    el.animate([
      { transform: `translateY(0) translateX(0) rotate(0deg)`, opacity: 1 },
      { transform: `translateY(100vh) translateX(${drift}px) rotate(${Math.random()*720}deg)`, opacity: 0 }
    ], { duration, easing: "cubic-bezier(.25,.46,.45,.94)", fill: "forwards" })
      .onfinish = () => el.remove();
  }
}

export default function App() {
  const [myId]            = useState(uid);
  const [screen,setScreen]= useState("home");
  const [nameInput,setNameInput] = useState("");
  const [codeInput,setCodeInput] = useState(getRoomFromURL()||"");
  const [isObsInput,setIsObsInput] = useState(false);
  const [roomCode,setRoomCode]   = useState(null);
  const [myName,setMyName]       = useState("");
  const [players,setPlayers]     = useState({});
  const [story,setStory]         = useState("");
  const [storyInput,setStoryInput] = useState("");
  const [revealed,setRevealed]   = useState(false);
  const [scaleKey,setScaleKey]   = useState("fibonacci");
  const [showShare,setShowShare] = useState(false);
  const [connected,setConnected] = useState(false);
  const channelRef = useRef(null);
  const ablyRef    = useRef(null);
  const stateRef   = useRef({players:{},story:"",revealed:false,scaleKey:"fibonacci"});

  const applyState = useCallback((data)=>{
    stateRef.current = data;
    setPlayers(data.players||{});
    setStory(data.story||"");
    setRevealed(data.revealed||false);
    setScaleKey(data.scaleKey||"fibonacci");
    if(data.revealed) setScreen("results");
    else setScreen(s=>s==="home"?s:"voting");
  },[]);

  const connectAbly = useCallback((code)=>{
    if(ablyRef.current) ablyRef.current.close();
    const ably=new Ably.Realtime({key:ABLY_KEY,clientId:myId});
    ablyRef.current=ably;
    ably.connection.on("connected",()=>setConnected(true));
    ably.connection.on("disconnected",()=>setConnected(false));
    const ch=ably.channels.get("vivaplanning-"+code);
    channelRef.current=ch;
    ch.subscribe("state",msg=>applyState(msg.data));
    ch.subscribe("req",msg=>{ if(msg.clientId!==myId) ch.publish("state",stateRef.current); });
    return ch;
  },[myId,applyState]);

  const pub = useCallback((updater)=>{
    const next=updater({...stateRef.current,players:{...stateRef.current.players}});
    stateRef.current=next;
    setPlayers({...next.players});
    setStory(next.story);
    setRevealed(next.revealed);
    setScaleKey(next.scaleKey||"fibonacci");
    if(next.revealed) setScreen("results");
    channelRef.current?.publish("state",next);
  },[]);

  function createRoom(){
    if(!nameInput.trim()) return;
    const code=generateCode();
    const ch=connectAbly(code);
    const init={players:{[myId]:{name:nameInput.trim(),vote:null,observer:isObsInput}},story:"",revealed:false,scaleKey:"fibonacci"};
    stateRef.current=init;
    setPlayers(init.players);setStory("");setRevealed(false);setScaleKey("fibonacci");
    setTimeout(()=>ch.publish("state",init),500);
    setRoomCode(code);setMyName(nameInput.trim());
    setRoomInURL(code);setScreen("voting");setShowShare(true);
  }

  function joinRoom(){
    if(!nameInput.trim()||codeInput.length<4) return;
    const code=codeInput.trim().toUpperCase();
    const ch=connectAbly(code);
    setTimeout(()=>{
      ch.publish("req",{from:myId});
      setTimeout(()=>{
        pub(s=>({...s,players:{...s.players,[myId]:{name:nameInput.trim(),vote:null,observer:isObsInput}}}));
      },600);
    },500);
    setRoomCode(code);setMyName(nameInput.trim());
    setRoomInURL(code);setScreen("voting");
  }

  function castVote(cardId){
    pub(s=>({...s,players:{...s.players,[myId]:{...s.players[myId],vote:s.players[myId]?.vote===cardId?null:cardId}}}));
  }
  function saveStory(){ pub(s=>({...s,story:storyInput})); }
  function revealVotes(){ pub(s=>({...s,revealed:true})); }
  function changeScale(k){
    pub(s=>({...s,scaleKey:k,revealed:false,players:Object.fromEntries(Object.entries(s.players).map(([id,p])=>[id,{...p,vote:null}]))}));
  }
  function resetVotes(){
    const rp={};
    Object.entries(players).forEach(([id,p])=>{rp[id]={...p,vote:null};});
    pub(()=>({players:rp,story:storyInput,revealed:false,scaleKey}));
    setScreen("voting");
  }
  function kickPlayer(id){
    if(id===myId) return;
    pub(s=>{ const n={...s.players}; delete n[id]; return {...s,players:n}; });
  }

  const playerList = Object.entries(players).map(([id,p])=>({id,...p}));
  const voters     = playerList.filter(p=>!p.observer);
  const observers  = playerList.filter(p=>p.observer);
  const totalVoted = voters.filter(p=>p.vote).length;
  const allVoted   = voters.length>0 && totalVoted===voters.length;
  const myVote     = players[myId]?.vote||null;
  const amObserver = players[myId]?.observer||false;
  const cards      = SCALES[scaleKey]?.cards||SCALES.fibonacci.cards;

  const voteCounts={};
  voters.forEach(p=>{ if(p.vote) voteCounts[p.vote]=(voteCounts[p.vote]||0)+1; });
  const totalVotes   = Object.values(voteCounts).reduce((s,v)=>s+v,0);
  const winnerVoteId = Object.entries(voteCounts).sort((a,b)=>b[1]-a[1])[0]?.[0];
  const winnerCard   = cards.find(c=>c.id===winnerVoteId);
  const numericVoters= voters.filter(p=>p.vote&&cards.find(c=>c.id===p.vote&&!c.special));
  const avgVal = numericVoters.length>0
    ? (numericVoters.reduce((s,p)=>s+(cards.find(c=>c.id===p.vote)?.value||0),0)/numericVoters.length).toFixed(1)
    : null;
  const isConsensus = totalVotes>0 && Object.keys(voteCounts).length===1;
  const shareURL = roomCode?(()=>{const u=new URL(window.location.href);u.search="";u.searchParams.set("room",roomCode);return u.toString();})():"";

  const inputSt = {width:"100%",background:T.cream,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"11px 14px",color:T.ink,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif"};
  const ghostBtn = {background:T.paper,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"8px 14px",color:T.inkMid,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:600,boxShadow:`0 2px 8px ${T.shadow}`};

  // 鈹€鈹€ HOME 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  if(screen==="home") return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,#F5F0E8 0%,#EDE8DC 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-80,right:-80,width:320,height:320,borderRadius:"50%",background:"rgba(82,183,136,0.07)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:-60,left:-60,width:240,height:240,borderRadius:"50%",background:"rgba(233,196,106,0.1)",pointerEvents:"none"}}/>

      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{fontSize:13,fontWeight:600,color:T.accent,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Planning Poker</div>
        <h1 style={{fontSize:56,fontWeight:900,color:T.ink,letterSpacing:-2,margin:"0 0 8px",fontFamily:"'Playfair Display',serif",lineHeight:1}}>
          Viva<span style={{color:T.accent}}>.</span>
        </h1>
        <p style={{color:T.inkMid,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>Fibonacci 路 T-Shirt 路 Potencias 路 Multijugador en tiempo real</p>
      </div>

      <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:24,padding:"36px 40px",width:"100%",maxWidth:440,boxShadow:`0 24px 80px ${T.shadow},0 1px 0 rgba(255,255,255,0.8)`}}>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:11,fontWeight:600,color:T.inkLight,textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:7,fontFamily:"'DM Sans',sans-serif"}}>Tu nombre</label>
          <input value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(codeInput.length>=4?joinRoom():createRoom())} placeholder="Ej: Jordi, Mar铆a..." autoFocus style={inputSt}/>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:11,fontWeight:600,color:T.inkLight,textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:7,fontFamily:"'DM Sans',sans-serif"}}>
            C贸digo de sala <span style={{fontWeight:400,textTransform:"none",color:T.sand}}>(vac铆o = nueva sala)</span>
          </label>
          <input value={codeInput} onChange={e=>setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6))} onKeyDown={e=>e.key==="Enter"&&(codeInput.length>=4?joinRoom():createRoom())} placeholder="ABCD12" style={{...inputSt,color:T.accent,fontSize:20,fontFamily:"monospace",letterSpacing:5}}/>
        </div>
        <div style={{marginBottom:22}}>
          <Toggle checked={isObsInput} onChange={setIsObsInput} label="馃憗锔?Entrar como observador" sub="Ideal para Scrum Master y Product Owner"/>
        </div>
        <button onClick={codeInput.length>=4?joinRoom:createRoom} disabled={!nameInput.trim()} style={{width:"100%",background:nameInput.trim()?`linear-gradient(135deg,${T.accent},#1B4332)`:"#E0D8CC",border:"none",borderRadius:12,padding:"14px",color:nameInput.trim()?"#fff":T.sand,fontWeight:700,cursor:nameInput.trim()?"pointer":"not-allowed",fontSize:14,fontFamily:"'DM Sans',sans-serif",letterSpacing:.3,boxShadow:nameInput.trim()?`0 8px 24px rgba(45,106,79,0.3)`:"none",transition:"all .2s"}}>
          {isObsInput?"馃憗锔?Entrar a observar":(codeInput.length>=4?"Unirse a la sala 鈫?:"Crear sala nueva 鈫?)}
        </button>
      </div>

      <div style={{display:"flex",gap:10,marginTop:28,flexWrap:"wrap",justifyContent:"center"}}>
        {Object.entries(SCALES).map(([k,sc])=>(
          <div key={k} style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:6,fontSize:12,color:T.inkMid,fontFamily:"'DM Sans',sans-serif",boxShadow:`0 2px 8px ${T.shadow}`}}>
            <span>{sc.icon}</span><strong style={{color:T.ink}}>{sc.name}</strong><span style={{color:T.sand}}>{sc.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // 鈹€鈹€ VOTING 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  if(screen==="voting") return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,#F5F0E8 0%,#EDE8DC 100%)`,padding:"20px 16px"}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>

        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 14px",boxShadow:`0 2px 8px ${T.shadow}`}}>
              <span style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:16,color:T.ink}}>Viva</span>
              <span style={{color:T.accent,fontWeight:900,fontSize:16,fontFamily:"'Playfair Display',serif"}}>.</span>
            </div>
            <div style={{fontSize:12,color:T.inkMid,fontFamily:"'DM Sans',sans-serif"}}>
              <strong style={{color:T.ink}}>{myName}</strong>
              {amObserver&&<span style={{color:"#6366F1",marginLeft:6,fontSize:11}}>馃憗锔?observando</span>}
              {" 路 "}<span style={{fontFamily:"monospace",fontWeight:700,color:T.accent,letterSpacing:2}}>{roomCode}</span>
              <span style={{marginLeft:8,fontSize:10,color:connected?T.accentL:T.red}}>鈼?{connected?"en vivo":"reconectando..."}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <ScaleSwitcher current={scaleKey} onChange={changeScale}/>
            <button onClick={()=>setShowShare(s=>!s)} style={ghostBtn}>馃敆 Compartir</button>
            <button onClick={resetVotes} style={{...ghostBtn,color:T.red,borderColor:"#FECACA"}}>鈫?Resetear</button>
            {allVoted&&(
              <button onClick={revealVotes} style={{background:`linear-gradient(135deg,${T.accent},#1B4332)`,border:"none",borderRadius:10,padding:"10px 20px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",boxShadow:`0 6px 20px rgba(45,106,79,0.35)`,letterSpacing:.3}}>
                Revelar votos 鉁?              </button>
            )}
          </div>
        </div>

        {/* Share */}
        {showShare&&(
          <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:16,padding:"18px 20px",marginBottom:16,boxShadow:`0 4px 20px ${T.shadow}`}}>
            <div style={{fontSize:11,color:T.inkLight,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>Compartir sala</div>
            <div style={{display:"flex",gap:10,marginBottom:10,alignItems:"center"}}>
              <div style={{flex:1,background:T.cream,borderRadius:8,padding:"10px 16px",fontFamily:"monospace",fontSize:22,fontWeight:900,color:T.accent,letterSpacing:6,textAlign:"center",border:`1px solid ${T.border}`}}>{roomCode}</div>
              <CopyBtn text={roomCode} label="C贸digo"/>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1,background:T.cream,borderRadius:8,padding:"8px 14px",fontSize:11,color:T.inkLight,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",border:`1px solid ${T.border}`}}>{shareURL}</div>
              <CopyBtn text={shareURL} label="Link"/>
            </div>
          </div>
        )}

        {/* Story */}
        <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:16,padding:"16px 20px",marginBottom:16,boxShadow:`0 2px 12px ${T.shadow}`}}>
          <div style={{fontSize:11,color:T.inkLight,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Historia a estimar</div>
          <div style={{display:"flex",gap:10}}>
            <input value={storyInput} onChange={e=>setStoryInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveStory()} placeholder="Como usuario quiero... / PROJ-123" style={{flex:1,background:T.cream,border:`1.5px solid ${T.border}`,borderRadius:8,padding:"9px 14px",color:T.ink,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
            <button onClick={saveStory} style={ghostBtn}>Guardar</button>
          </div>
          {story&&<div style={{marginTop:8,fontSize:13,color:T.inkMid,fontStyle:"italic",padding:"7px 12px",background:T.cream,borderRadius:8,borderLeft:`3px solid ${T.accentL}`,fontFamily:"'DM Sans',sans-serif"}}>馃搵 {story}</div>}
        </div>

        {/* Cards 鈥?only voters */}
        {!amObserver&&(
          <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:20,padding:"28px 24px 20px",marginBottom:16,boxShadow:`0 4px 20px ${T.shadow}`}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div style={{fontSize:12,color:T.inkLight,fontWeight:600,textTransform:"uppercase",letterSpacing:1,fontFamily:"'DM Sans',sans-serif"}}>
                Tu voto 路 <span style={{color:T.accent}}>{SCALES[scaleKey].name}</span>
              </div>
              {myVote&&<div style={{fontSize:12,color:T.accentL,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>鉁?Voto registrado</div>}
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
              {cards.map(card=><PokerCard key={card.id} card={card} selected={myVote===card.id} onClick={()=>castVote(card.id)}/>)}
            </div>
          </div>
        )}

        {/* Observer banner */}
        {amObserver&&(
          <div style={{background:"#EEF2FF",border:"1.5px solid #C7D2FE",borderRadius:16,padding:"20px 24px",marginBottom:16,textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>馃憗锔?/div>
            <div style={{fontWeight:700,fontSize:15,color:"#4338CA",fontFamily:"'Playfair Display',serif"}}>Modo observador</div>
            <div style={{fontSize:12,color:"#818CF8",marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>{totalVoted}/{voters.length} han votado{allVoted?" 路 隆Listos para revelar!":""}</div>
          </div>
        )}

        {/* Felt table */}
        <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:20,padding:"24px",marginBottom:observers.length>0?12:0,boxShadow:`0 4px 20px ${T.shadow}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontSize:12,color:T.inkLight,fontWeight:600,textTransform:"uppercase",letterSpacing:1,fontFamily:"'DM Sans',sans-serif"}}>Votantes 路 {totalVoted}/{voters.length} listos</div>
            {allVoted&&<span style={{fontSize:12,color:T.accentL,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>隆Todos listos! 鉁?/span>}
          </div>
          <div style={{background:"linear-gradient(135deg,#2D6A4F,#1B4332)",borderRadius:60,padding:"32px 24px",margin:"0 auto",maxWidth:700,minHeight:140,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`inset 0 4px 24px rgba(0,0,0,0.3),0 4px 20px rgba(45,106,79,0.3)`,position:"relative",border:"6px solid #3D1A08",outline:"3px solid rgba(255,255,255,0.05)"}}>
            <div style={{position:"absolute",inset:8,borderRadius:54,border:"1px solid rgba(255,255,255,0.08)",pointerEvents:"none"}}/>
            <div style={{display:"flex",gap:20,flexWrap:"wrap",justifyContent:"center",alignItems:"flex-end"}}>
              {voters.map(p=>(
                <PlayerCard key={p.id} player={p} revealed={false} scaleKey={scaleKey} isMe={p.id===myId} onKick={()=>kickPlayer(p.id)} isObserver={false}/>
              ))}
              {voters.length===0&&<div style={{color:"rgba(255,255,255,0.3)",fontSize:13,fontFamily:"'DM Sans',sans-serif",fontStyle:"italic"}}>Esperando jugadores...</div>}
            </div>
          </div>
          <div style={{marginTop:14,height:4,background:T.cream,borderRadius:2,overflow:"hidden",border:`1px solid ${T.border}`}}>
            <div style={{height:"100%",width:`${voters.length>0?(totalVoted/voters.length)*100:0}%`,background:`linear-gradient(90deg,${T.accentL},${T.accent})`,borderRadius:2,transition:"width 0.5s"}}/>
          </div>
        </div>

        {/* Observers strip */}
        {observers.length>0&&(
          <div style={{background:"#EEF2FF",border:"1px solid #C7D2FE",borderRadius:14,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:"#6366F1",fontWeight:600,textTransform:"uppercase",letterSpacing:1,fontFamily:"'DM Sans',sans-serif",flexShrink:0}}>馃憗锔?Observando</span>
            {observers.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,background:"#fff",border:"1px solid #C7D2FE",borderRadius:20,padding:"4px 12px 4px 8px"}}>
                <span style={{fontSize:14}}>馃憗锔?/span>
                <span style={{fontSize:12,color:"#4F46E5",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{p.name}{p.id===myId?" (t煤)":""}</span>
                {p.id!==myId&&(
                  <button onClick={()=>kickPlayer(p.id)} style={{marginLeft:4,background:"#FEE2E2",border:"none",borderRadius:"50%",width:16,height:16,cursor:"pointer",fontSize:9,color:T.red,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>鉁?/button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 鈹€鈹€ RESULTS 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  if(screen==="results") return (
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,#F5F0E8 0%,#EDE8DC 100%)`,padding:"20px 16px"}}>
      <div style={{maxWidth:1000,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:11,fontWeight:600,color:T.accentL,letterSpacing:3,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>Resultados 路 {SCALES[scaleKey].name}</div>
          <h2 style={{fontSize:34,fontWeight:900,color:T.ink,fontFamily:"'Playfair Display',serif",margin:"0 0 6px"}}>Votos revelados</h2>
          {story&&<div style={{fontSize:14,color:T.inkMid,fontStyle:"italic",background:T.paper,borderRadius:10,padding:"8px 18px",display:"inline-block",marginTop:4,border:`1px solid ${T.border}`,fontFamily:"'DM Sans',sans-serif"}}>馃搵 {story}</div>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
          {/* Distribution */}
          <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:20,padding:"24px",boxShadow:`0 4px 20px ${T.shadow}`}}>
            <div style={{fontSize:11,color:T.inkLight,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>Distribuci贸n</div>
            {cards.filter(c=>voteCounts[c.id]).map(c=>{
              const count=voteCounts[c.id]||0;
              const pct=totalVotes>0?(count/totalVotes)*100:0;
              const isW=c.id===winnerVoteId;
              return (
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${T.cream}`}}>
                  <div style={{width:44,height:62,borderRadius:7,background:isW?T.accent:T.cream,border:`1.5px solid ${isW?T.accentL:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:c.id==="cof"?20:(c.label.length>2?13:18),fontWeight:900,color:isW?"#fff":T.ink,fontFamily:"'Playfair Display',serif",flexShrink:0}}>
                    {c.id==="cof"?"鈽?:c.label}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:13,fontWeight:700,color:isW?T.accent:T.inkMid,fontFamily:"'DM Sans',sans-serif"}}>
                        {c.id==="cof"?"Caf茅 鈽?:(c.id==="inf"?"鈭?No estimable":c.label)}{isW?" 鉁?:""}
                      </span>
                      <span style={{fontSize:12,color:T.inkLight,fontFamily:"'DM Sans',sans-serif"}}>{count}/{totalVotes}</span>
                    </div>
                    <div style={{height:7,background:T.cream,borderRadius:4,overflow:"hidden",border:`1px solid ${T.border}`}}>
                      <div style={{height:"100%",width:`${pct}%`,background:isW?`linear-gradient(90deg,${T.accentL},${T.accent})`:"#C4B89A",borderRadius:4,transition:"width 0.8s cubic-bezier(.34,1.56,.64,1)"}}/>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{marginTop:16,padding:"14px 16px",background:isConsensus?"#EEF7F2":"#FFF7ED",borderRadius:12,border:`1px solid ${isConsensus?T.accentL:"#FED7AA"}`,textAlign:"center"}}>
              <div style={{fontSize:11,color:T.inkLight,marginBottom:4,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",letterSpacing:.5}}>
                {winnerCard?.id==="cof"?"Necesit谩is un descanso 鈽?:(winnerCard?.id==="inf"?"Historia no estimable":"Estimaci贸n ganadora")}
              </div>
              <div style={{fontSize:28,fontWeight:900,color:isConsensus?T.accent:T.inkMid,fontFamily:"'Playfair Display',serif"}}>
                {winnerCard?.id==="cof"?"鈽?:(winnerCard?.id==="inf"?"鈭?:(winnerCard?.label||"鈥?))}
                {avgVal&&winnerCard?.id!=="cof"&&winnerCard?.id!=="inf"&&(
                  <span style={{fontSize:14,color:T.inkLight,fontWeight:400,marginLeft:10,fontFamily:"'DM Sans',sans-serif"}}>prom. {avgVal}</span>
                )}
              </div>
            </div>
          </div>

          {/* Votes on table */}
          <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:20,padding:"24px",boxShadow:`0 4px 20px ${T.shadow}`}}>
            <div style={{fontSize:11,color:T.inkLight,fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>Votos individuales</div>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center",padding:"20px 16px",background:"linear-gradient(135deg,#2D6A4F,#1B4332)",borderRadius:16,border:"4px solid #3D1A08",boxShadow:`inset 0 4px 20px rgba(0,0,0,0.3)`}}>
              {voters.sort((a,b)=>{
                const va=cards.find(c=>c.id===a.vote)?.value||0;
                const vb=cards.find(c=>c.id===b.vote)?.value||0;
                return vb-va;
              }).map(p=>(
                <PlayerCard key={p.id} player={p} revealed={true} scaleKey={scaleKey} isMe={p.id===myId} onKick={()=>kickPlayer(p.id)} isObserver={false}/>
              ))}
            </div>
            {observers.length>0&&(
              <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${T.border}`}}>
                <div style={{fontSize:11,color:"#6366F1",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>馃憗锔?Observadores</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {observers.map(p=>(
                    <span key={p.id} style={{background:"#EEF2FF",border:"1px solid #C7D2FE",borderRadius:20,padding:"4px 12px",fontSize:12,color:"#4F46E5",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{p.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Consensus */}
        <div style={{background:isConsensus?"#EEF7F2":"#FFF5F5",border:`1.5px solid ${isConsensus?T.accentL:"#FECACA"}`,borderRadius:14,padding:"16px 20px",marginBottom:20,textAlign:"center"}}>
          {isConsensus
            ? <div style={{color:T.accent,fontWeight:700,fontSize:15,fontFamily:"'DM Sans',sans-serif"}}>鉁?隆Consenso total! Todo el equipo estim贸 lo mismo.</div>
            : <div style={{color:T.red,fontWeight:700,fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>Hay diferencias 路 Discutid y votad de nuevo 路 Los extremos deben explicar su razonamiento</div>
          }
        </div>

        {/* Actions */}
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={resetVotes} style={{background:`linear-gradient(135deg,${T.accent},#1B4332)`,border:"none",borderRadius:12,padding:"13px 30px",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif",boxShadow:`0 6px 20px rgba(45,106,79,0.3)`,letterSpacing:.3}}>
            鈫?Nueva votaci贸n
          </button>
          <button onClick={()=>setShowShare(s=>!s)} style={{...ghostBtn,borderRadius:12,padding:"13px 20px",fontSize:13}}>馃敆 Compartir sala</button>
          <button onClick={()=>setScreen("voting")} style={{...ghostBtn,borderRadius:12,padding:"13px 20px",fontSize:13}}>鈫?Volver a sala</button>
        </div>

        {showShare&&(
          <div style={{background:T.paper,border:`1px solid ${T.border}`,borderRadius:14,padding:"16px 20px",marginTop:16,boxShadow:`0 4px 20px ${T.shadow}`}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{flex:1,background:T.cream,borderRadius:8,padding:"8px 14px",fontFamily:"monospace",fontSize:22,fontWeight:900,color:T.accent,letterSpacing:6,textAlign:"center",border:`1px solid ${T.border}`}}>{roomCode}</div>
              <CopyBtn text={shareURL} label="Copiar link"/>
            </div>
          </div>
        )}
      </div>
    </div>
  );


  // Confeti al consenso
  useEffect(() => {
    if (screen === "results" && isConsensus) {
      launchConfetti();
    }
  }, [screen, isConsensus]);

  return null;
}

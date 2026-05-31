import React from "react";

const fallbackStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "linear-gradient(135deg,#F5F0E8 0%,#EDE8DC 100%)",
  color: "#1a1a2e",
  fontFamily: "'DM Sans', sans-serif",
};

const panelStyle = {
  width: "min(520px, 100%)",
  background: "#FDFAF4",
  border: "1.5px solid #DDD5C0",
  borderRadius: 16,
  padding: 28,
  boxShadow: "0 16px 48px rgba(26,26,46,0.12)",
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("[Viva] Render error", error, errorInfo);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={fallbackStyle}>
        <div style={panelStyle}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#BC4749",marginBottom:10}}>
            Error de la aplicacion
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:30,lineHeight:1.1,margin:"0 0 10px"}}>
            Algo fallo al cargar Viva.
          </h1>
          <p style={{fontSize:14,lineHeight:1.6,color:"#4A4A6A",margin:"0 0 18px"}}>
            La app encontro un problema inesperado. Recarga la pagina y, si sigue pasando, revisa la consola del navegador para ver el detalle tecnico.
          </p>
          {import.meta.env.DEV && this.state.error?.message && (
            <pre style={{whiteSpace:"pre-wrap",background:"#F5F0E8",border:"1px solid #DDD5C0",borderRadius:10,padding:12,fontSize:12,color:"#BC4749",overflow:"auto"}}>
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{marginTop:16,background:"#2D6A4F",border:"none",borderRadius:10,padding:"11px 18px",color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}

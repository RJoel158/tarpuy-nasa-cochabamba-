import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HorizontalCarousel({ label, kind = "day", children }) {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start:true, end:false });
  useEffect(()=>{
    const node=track.current;
    const update=()=>setEdges({start:node.scrollLeft<=2,end:node.scrollLeft+node.clientWidth>=node.scrollWidth-2});
    update(); node.addEventListener("scroll",update,{passive:true});
    const observer=typeof ResizeObserver!=="undefined" ? new ResizeObserver(update) : null;
    observer?.observe(node);
    return ()=>{node.removeEventListener("scroll",update);observer?.disconnect();};
  },[children]);
  const move=direction=>{
    const node=track.current, item=node.firstElementChild;
    node.scrollBy({left:direction*((item?.getBoundingClientRect().width||node.clientWidth)+16),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
  };
  return <section aria-label={label} className={`tarpuy-carousel tarpuy-carousel--${kind}`}>
    <div className="tarpuy-carousel-controls"><span className="text-sm text-slate-600">Desliza para ver más</span><div className="flex gap-2">
      <button type="button" aria-label={`Anterior: ${label}`} disabled={edges.start} onClick={()=>move(-1)}><ChevronLeft size={22}/></button>
      <button type="button" aria-label={`Siguiente: ${label}`} disabled={edges.end} onClick={()=>move(1)}><ChevronRight size={22}/></button>
    </div></div>
    <div ref={track} className="tarpuy-carousel-track" tabIndex={0}>{children}</div>
  </section>;
}

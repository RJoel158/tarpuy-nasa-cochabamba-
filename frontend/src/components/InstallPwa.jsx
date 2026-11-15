import React, { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Download, Share, X } from "lucide-react";
import { pwaInstaller, isIosDevice } from "../services/pwaInstall.js";
import MamaTomasaBrand from "./MamaTomasaBrand.jsx";

export default function InstallPwa() {
  const state = useSyncExternalStore(pwaInstaller.subscribe, pwaInstaller.getSnapshot);
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const titleId = useId();
  const ios = isIosDevice(navigator);
  useEffect(() => {
    if (open && !state.installed) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open, state.installed]);
  if (state.installed) return null;
  return <div className="pwa-install-entry">
    <button type="button" className="pwa-install-trigger" onClick={() => setOpen(true)}>
      <Download size={20} aria-hidden="true" /> Instalar Tarpuy
    </button>
    {createPortal(<dialog ref={dialog} lang="es-BO" className="pwa-install-dialog" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} aria-labelledby={titleId}>
      <div className="pwa-install-sheet">
        <button type="button" onClick={() => setOpen(false)} className="pwa-install-close" aria-label="Cerrar instalación"><X aria-hidden="true" /></button>
        <MamaTomasaBrand compact />
        <h2 id={titleId} className="text-2xl font-extrabold">Tarpuy, a mano en tu celular</h2>
        <p>Ábrelo desde tu pantalla de inicio. Podrás consultar la información que ya se haya guardado cuando no tengas conexión.</p>
        <p className="text-sm text-[var(--tinta-suave)]">El clima nuevo, los mapas no guardados y la generación de voz necesitan internet.</p>
        {!window.isSecureContext ? <p role="status">Para instalarla en el celular, abre la web mediante una dirección HTTPS.</p> : state.available ?
          <button type="button" className="flow-primary w-full" onClick={() => pwaInstaller.install()}>Instalar en este dispositivo <Download size={20} aria-hidden="true" /></button>
          : state.installing ? <p role="status">Completa la instalación en la ventana del navegador…</p>
          : state.outcome === "accepted" ? <p role="status">Aceptaste la instalación. El navegador se encargará de completarla.</p>
          : <div className="pwa-install-steps">
            <h3 className="font-extrabold">{ios ? "En iPhone o iPad" : "Desde tu navegador"}</h3>
            <ol className="list-decimal pl-5 space-y-2">
              {ios ? <><li>Abre esta web en Safari.</li><li>Pulsa <Share className="inline" size={18} aria-hidden="true" /> Compartir y elige «Añadir a pantalla de inicio».</li><li>Confirma con «Añadir».</li></> : <><li>Abre el menú del navegador.</li><li>Busca «Instalar aplicación» o «Añadir a pantalla de inicio».</li><li>Confirma la opción que te ofrezca el navegador.</li></>}
            </ol>
            {!ios && <p className="text-sm mt-3">Si no aparece, abre Tarpuy en Chrome o Edge. La opción depende del navegador y del dispositivo.</p>}
          </div>}
        {state.outcome === "dismissed" && <p role="status" className="text-sm">Puedes seguir usando la web e instalarla más adelante.</p>}
        {state.error && <p role="status">{state.error}</p>}
        <button type="button" className="min-h-12 underline font-bold" onClick={() => setOpen(false)}>Seguir en la web</button>
      </div>
    </dialog>, document.body)}
  </div>;
}

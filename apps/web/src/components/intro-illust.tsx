export function IntroIllustration({ class: className }: { class?: string }) {
    return (
        <>
            <svg
                id="intro-illust"
                width="540"
                height="480"
                viewBox="0 0 623 397"
                class={className}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
            >
                <g id="intro-1">
                    <rect
                        x="4.5"
                        y="111.5"
                        width="614"
                        height="173"
                        rx="23.5"
                        fill="#151419"
                    />
                    <rect
                        x="4.5"
                        y="111.5"
                        width="614"
                        height="173"
                        rx="23.5"
                        stroke="#2A2638"
                    />
                </g>
            </svg>

            <style>{`@keyframes iLEnter{from{opacity:0;translate:0 80px;filter:blur(4px)}to{opacity:1;translate:0 0;filter:blur(0)}}@keyframes iLExit{from{opacity:1;scale:1;filter:blur(0)}to{opacity:0;scale:0.95;filter:blur(4px)}}@keyframes iLPulse{50%{opacity:.5}}@keyframes iLFadeIn{from{opacity:0}to{opacity:1}}@keyframes iLProgress{from{x:317px;w:185px}to{x:502px;w:0px}}@keyframes iLClick{50%{scale:0.9}}@keyframes iLShow{from{scale:0}to{scale:1}}#intro-1,#intro-2,#intro-3,#intro-4{transform-origin:top center}#intro-1 path,#intro-2,#intro-3,#intro-4{opacity:0}#intro-1[data-animation=exit] path{opacity:1}#intro-2 #allow{transform-origin:67% 80%}#intro-1[data-animation=replay],#intro-2[data-animation=play],#intro-3[data-animation=play],#intro-4[data-animation=play]{opacity:0;animation:.4s cubic-bezier(.18,.89,.31,1.13) .1s forwards iLEnter}#intro-1[data-animation=exit],#intro-2[data-animation=exit],#intro-3[data-animation=exit],#intro-4[data-animation=exit]{animation:.4s forwards iLExit}#intro-1[data-animation=play] path,#intro-1[data-animation=replay] path{opacity:0;animation:.2s forwards iLFadeIn}#intro-2[data-animation=play] #dots path{animation:3s cubic-bezier(.4,0,.6,1) infinite iLPulse}#intro-2[data-animation=play] #dots path:nth-child(2){animation-delay:.2s}#intro-2[data-animation=play] #dots path:nth-child(3){animation-delay:.4s}#intro-2[data-animation=play] #progress{animation:1.3s cubic-bezier(.46,.03,.52,.96) .3s forwards iLProgress}#intro-2[data-animation=play] #allow{animation:.3s 2s forwards iLClick}#intro-4 #check{transform-origin:34% 57%}#intro-4[data-animation=play] #check{scale:0;animation:.4s cubic-bezier(.18,.89,.31,1.13) .2s forwards iLShow}`}</style>
            <script
                dangerouslySetInnerHTML={{
                    __html: `document.currentScript?.remove(),(async()=>{let e=e=>new Promise(t=>setTimeout(t,e)),t=fetch("/intro-illust.svg").then(e=>e.text());await ("complete"===document.readyState||"interactive"===document.readyState?Promise.resolve():new Promise(e=>addEventListener("DOMContentLoaded",e,{once:!0})));let a=document.querySelector("svg#intro-illust"),r=document.createElement("template");r.innerHTML=await t;let i=r.content.querySelector("svg");if(!i)return console.error("SVG not found");a.replaceChildren(...Array.from(i.childNodes).map(e=>document.importNode(e,!0)));let[n,o,l,c]=["#intro-1","#intro-2","#intro-3","#intro-4"].map(e=>a.querySelector(e)),p=(e,t)=>e.setAttribute("data-animation",t);async function y(t=!1){p(n,t?"replay":"play"),await e(2500),p(n,"exit"),p(o,"play"),await e(3e3),p(o,"exit"),p(l,"play"),await e(2500),p(l,"exit"),p(c,"play"),await e(5e3),p(c,"exit"),await e(1500),y(!0)}y()})();`,
                }}
            />
        </>
    );
}

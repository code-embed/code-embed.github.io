// Generic Web Component loader for NA-ME.github.io hosting
// <script src="https://NA-ME.github.io/name.js">
// Loading:
//  - NA-ME-baseclass.js
//  - NA-ME-pro.js (optional)
((
    scriptSrc = document.currentScript.src,
    version = new URL(scriptSrc).searchParams.get("v"), // or undefined
    filename = scriptSrc.split("/").pop().split("."),
    name = filename[0],
    minified = filename[1] == "min" ? filename[1] : "",
    prefix = location.hostname.includes("github.io") ? `https://${name}.github.io/` : ""
) => {
    console.log(location.hostname)
    document.head.append(...[name + `-baseclass${minified}.js`, ...(version ? [name + `-${version}${minified}.js`] : [])]
        .map(src => Object.assign(document.createElement("script"), {
            title: "injected", src: prefix + src, async: true, type: "module", onload: () => version && console.log("Loaded:", src)
        })));
    customElements.whenDefined(name + "-baseclass").then(B => !version && customElements.define(name, class extends B { })
    );
})();

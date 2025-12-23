!(function () {
    const url = new URL(document.currentScript?.src || "");
    const componentName = url.searchParams.get("name") || "source-viewer";
    // ********************************************************************
    // best helper function ever
    const createElement = (tag, props = {}) => Object.assign(document.createElement(tag), props);
    // ******************************************************************** define component
    customElements.define(componentName, class extends HTMLElement {
        // ==================================================================== connectedCallback
        connectedCallback() {
            setTimeout(() => { // make sure lightDOM is parsed
                // ------------------------------------------------------------ get attributes
                const src = this.getAttribute("src");
                console.warn(src)
                // ------------------------------------------------------------ set shadowDOM
                this.attachShadow({ mode: "open" })
                    .append(
                        createElement("style", {
                            textContent:
                                `h3{margin-bottom:0.5em}` +
                                `details{padding:1em}` +
                                `summary{cursor:pointer}` +
                                `b{color:blue}` +
                                `code-embed{margin-left:2em}`
                        }),
                        createElement("hr"),
                        createElement("h3", { innerHTML: src }),
                        createElement("div", { innerHTML: this.innerHTML }),
                        this.details = createElement("details", {
                            open: this.hasAttribute("open")
                        })
                ); // append
                // ------------------------------------------------------------ set details content
                this.details.append(
                    createElement("summary", {
                        innerHTML: `<b>see: ${src}</b>`
                    }),
                    // creation already fires the attributeChangedCallback in code-embed-lite.js
                    // but there is no src set yet, so explicit fetch() is needed below
                    this.embed = createElement("code-embed")
                );
                this.embed.setAttribute("src", src);
                this.embed.setAttribute("tabsize", 2);
                this.embed.setAttribute("rows", this.getAttribute("rows") || "fit");
                this.embed.setAttribute("exportparts", "textarea:source");
                this.embed.fetch();
                // ------------------------------------------------------------ fix rows
                document.addEventListener(`code-embed`, (evt) => {
                    if (src === evt.detail.src) {
                        evt.composedPath()[0].fitrows()
                    }
                });
            })
        }
    })
})();
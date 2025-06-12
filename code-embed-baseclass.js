(function () {

    let fileName = document.currentScript.src.split("/").slice(-1)[0];

    const url = new URL(document.currentScript && document.currentScript.src || "");
    const componentName = url.searchParams.get("name") || "code-embed-baseclass";

    const _FONTNAME_ = `FontWithASyntaxHighlighter-Regular`;

    // ********************************************************************
    const createElement = (tag, options = {}, ...children) => {
        let { styles = {}, ...props } = options;
        const el = document.createElement(tag);
        Object.assign(el.style, styles);
        el.append(...children);
        return Object.assign(el, props);
    }

    // ********************************************************************
    customElements.define(componentName, class extends HTMLElement {
        get lineHeight() {
            return 1.2;
        }
        set lineHeight(val) {
        }
        get fontSize() {
            if (!this.textarea) return null;
            const fs = getComputedStyle(this.textarea).fontSize;
            return isNaN(parseFloat(fs)) ? fs : parseFloat(fs);
        }
        set fontSize(val) {
            if (this.textarea) {
                this.textarea.style.fontSize = typeof val === "number" ? `${val}px` : val;
                this.linenumbers({});
            }
        }
        constructor() {
            super().attachShadow({ mode: "open" })
                .append(
                    this.mainstyle = createElement("style", {
                        id: "main",
                        textContent:
                            `textarea{white-space:pre;width:100%;line-height:1em}`
                    }),
                    // Syntax Highlight
                    // this.colors inject STYLE in <head>
                    this.palettestyle = createElement("style", {}),
                    this.background = createElement("style", {
                        id: "background"
                    }),
                    this.overlaystyle = createElement("style", {
                        id: "overlaystyle",
                        textContent:
                            `#overlay{position:absolute;width:100%}` +
                            `#overlay{display:none;margin-left:4ch;background:green;color:yellow}`
                    }),
            )
            // div/textarea appended in connectedCallback
        }
        createStyle() {
            const getColorProperty = name => getComputedStyle(this).getPropertyValue('--code-embed-color_' + name);
            // ----------------------------------------------------------------
            this.colors = (this.colors || document.head.querySelector("style#" + this.colors_id));
            if (!this.colors) {
                this.colors_id = "codeEmbedcolors_" + crypto.randomUUID().replaceAll("-", "");
                this.colors = document.head.appendChild(
                    createElement("style", {
                        title: "injected",
                        id: this.colors_id,
                        set: ({
                            // ------------------------------------------------
                            color_tag = getColorProperty("tag") || "#ec8065",
                            color_comment = getColorProperty("comment") || "#b6c2a3",
                            color_keyword = getColorProperty("keyword") || "#C792EA",
                            color_function = getColorProperty("function") || "#82AAFF",
                            color_string = getColorProperty("string") || "#37c92c",
                            color_number = getColorProperty("number") || "#1ac6ff",
                            color_variable = getColorProperty("variable") || "#FFFFFF",
                            color_constant = getColorProperty("constant") || "#FFCB6B",
                            color_special = getColorProperty("comment") || "#ff79c6",
                            // ------------------------------------------------
                            color_background = this.getAttribute("color_background") || "var(--code-embed-color_background,black)",
                            color_text = this.getAttribute("color_text") || "var(--code-embed-color_text,#6A9955)",
                            // ------------------------------------------------
                            font = _FONTNAME_,
                            fontfile = `https://code-embed.github.io/font/${font}.woff2`,
                            newfont = new FontFace(font, `url('${fontfile}')`),
                            palette = `--SyntaxHighlighter`
                        }) => {
                            this.palettestyle.textContent =
                                `textarea{font-palette:${palette};font:1em '${font}'}` +
                                `textarea{background:${color_background};color:${color_text}}`;
                            this.colors.textContent = `@font-face{font-weight:normal;font-style:normal;font-display:swap}` +
                                `@font-palette-values ${palette}{font-family:'${font}';override-colors:` +
                                // override-colors requires actual color values (hex, rgb, etc.) at parse time, not CSS custom properties.
                                ` 0 ${color_tag}, 1 ${color_comment}, 2 ${color_keyword}, 3 ${color_function},` +
                                ` 4 ${color_string}, 5 ${color_number}, 6 ${color_variable}, 7 ${color_constant}, 8 ${color_special}` +
                                `}`;
                            if (!window["__" + _FONTNAME_]) {
                                window["__" + _FONTNAME_] = true;
                                newfont.load().then(() => {
                                    document.fonts.add(newfont);
                                    console.log(`%c Font loaded `, "font-size:75%;background:orange;color:black", fontfile);
                                }).catch(e => {
                                    console.error("Font failed to load:", fontfile, e);
                                });
                            }
                        }
                    }));
            }
            this.colors.set({});
        }
        connectedCallback() {
            this.connect();
        }
        connect() {
            this.connect = () => { }
            this.createStyle();
            this.shadowRoot.append(
                createElement("div",
                    {
                        styles: {
                            position: "relative"
                        }
                    },
                    (this.textarea = createElement("textarea", {
                        rows: this.getAttribute("rows") || 40,
                        readOnly: this.hasAttribute("readonly"),
                        styles: { width: "100%", display: "none" }
                    })),
                    this.overlayed = createElement("div",
                        {
                            id: "overlay"
                        },
                    ),
                )
            );
            this.fetch();
        }
        fadein() {
            const afterFontLoaded = () => {
                this.textarea.style.display = "block";
                this.textarea.style.opacity = 0;
                this.textarea.style.transition = "opacity 0.3s";
                requestAnimationFrame(() => this.textarea.style.opacity = 1);
            }
            if (document.fonts && document.fonts.check(`1em '${_FONTNAME_}'`)) {
                afterFontLoaded();
            } else if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    afterFontLoaded();
                });
            } else {
                afterFontLoaded();
            }
        }
        fetch(src = this.getAttribute("src")) {
            fetch(src)
                .then(result => result.ok ? result.text() : Promise.reject(result.status))
                .then(value => {
                    console.log(`%c fetched `, "font-size:75%;background:blue", src)
                    this.value = value;
                    this.fadein();
                }).catch((e) => {
                    console.error(e);
                    this.innerHTML = `Unable to load(${e}): ` + src
                });
        }
        get src() {

        }
        set src(src) {
            setTimeout(() => {
                this.fetch(src)
            }, 0);
        }
        get value() {
            return this.textarea.value;
        }
        set value(value) {
            this.textarea.value = value;
            if (this.linenumbers) this.linenumbers({})
        }
    });

    console.log(`%c Loaded %c %s `, "font-size:75%", "background:blue", fileName)

})();
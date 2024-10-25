import { describe, beforeEach, it, expect } from "vitest";
import {xml_pretty_print} from "./xml2.js";

function reformat(original: string) {
    const parser = new DOMParser();
    dprint('converting',original);
    const xmlDoc = parser.parseFromString(original,"text/xml"); //important to use "text/xml"
    const str = xml_pretty_print(xmlDoc)
    dprint("printed",str)
    return str
}

function dprint(desc: string, formatted: string) {
    console.log(desc);
    console.log(formatted.replaceAll(' ','.').replaceAll('\n','N\n').trimEnd());
}

/**
 *  @vitest-environment jsdom
 */
describe("xml to text",() => {
    it("should pretty print an document", () => {
        const original = "<document></document>"
        const formatted = `<document>
</document>\n`
        expect(reformat(original)).toEqual(formatted)
    })
    it("should pretty print an b", () => {
        const original = "<b>text</b>"
        const formatted = `<b>text</b>`
        expect(reformat(original)).toEqual(formatted)
    })
    it("should pretty print an h1", () => {
        const original = "<h1>text</h1>"
        const formatted = `<h1>text</h1>\n`
        dprint("should be",formatted)
        expect(reformat(original)).toEqual(formatted)
    })
    it("should pretty print an document, h1", () => {
        const original = "<document><h1>text</h1></document>"
        const formatted = `<document>
    <h1>text</h1>
</document>
`
        dprint("should be",formatted)
        expect(reformat(original).trim()).toEqual(formatted.trim())
    })
    it('should pretty print a paragraph', () => {
        const original =  `<p>some cool text with <b>bold</b> and <i>italics</i></p>`
        const formatted = `<p>some cool text with <b>bold</b> and <i>italics</i></p>`
        dprint("should be",formatted)
        expect(reformat(original).trim()).toEqual(formatted.trim())
    })

    /*

    "<document></document>"
    "<document>
    </document>"

    "<h1>text</h1>"
    "<h1>text</h1>"

    "<document><h1>text</h1></document>"
    "<document>
        <h1>text</h1>
     </document>"

    "<p>some cool text with <b>bold</b> and <i>italics</i><p>"

     */
})

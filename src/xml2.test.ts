import { describe, beforeEach, it, expect } from "vitest";
import {xml_pretty_print} from "./xml2.js";

function reformat(original: string) {
    const parser = new DOMParser();
    console.log("== converting")
    console.log(original);
    const xmlDoc = parser.parseFromString(original,"text/xml"); //important to use "text/xml"
    const str = xml_pretty_print(xmlDoc)
    console.log("== printed")
    console.log(str)
    return str
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
    it("should pretty print an h1", () => {
        const original = "<h1>text</h1>"
        const formatted = `<h1>text</h1>\n`
        expect(reformat(original)).toEqual(formatted)
    })
    it("should pretty print an document, h1", () => {
        const original = "<document><h1>text</h1></document>"
        const formatted = `<document>
    <h1>text</h1>
</document>`
        expect(reformat(original)).toEqual(formatted)
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

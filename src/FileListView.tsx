import {FileInfo, Site} from "./model.js";
import {useState} from "react";
import {ListView, StringRenderer, useChanged} from "rtds-react";
import {ObjMaybe} from "rtds-core";

const renderFile: StringRenderer<typeof FileInfo> = (value: typeof FileInfo) => {
    return `${value.get('fileName')}, ${value.get('fileType')}`
}

export function FileListView(props: { className: string, site: typeof Site }) {
    let selected = props.site.get('selectedFile')
    useChanged(props.site)
    return <div className={'file-list'}>
        <ListView data={props.site.get('files')}
                  renderer={renderFile}
                  selected={selected}
                  onSelect={(e) => {
                      props.site.set('selectedFile',e)
                  }}
        />
    </div>
}

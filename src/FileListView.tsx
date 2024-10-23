import {FileInfo, Site} from "./model.js";
import {useState} from "react";
import {ListItemRenderer, ListView, StringRenderer, useChanged} from "rtds-react";
import {ObjMaybe} from "rtds-core";

const rend:ListItemRenderer<typeof FileInfo> = (value) => {
    return <span className={'file-item'}>{value.get('fileName').get()}</span>
}

export function FileListView(props: { className: string, site: typeof Site }) {
    let selected = props.site.get('selectedFile')
    useChanged(props.site)
    return <div className={'file-list'}>
        <ListView data={props.site.get('files')}
                  itemRenderer={rend}
                  selected={selected}
                  onSelect={(e) => {
                      props.site.set('selectedFile',e)
                  }}
        />
    </div>
}

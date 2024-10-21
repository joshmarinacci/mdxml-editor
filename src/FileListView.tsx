import {FileInfo, Site} from "./model.js";
import {useState} from "react";
import {ListView, StringRenderer} from "rtds-react";

const renderFile: StringRenderer<typeof FileInfo> = (value: typeof FileInfo) => {
    return `${value.get('fileName')}, ${value.get('fileType')}`
}

export function FileListView(props: { className: string, site: typeof Site }) {
    const [selected, setSelected] = useState<typeof FileInfo>()
    return <div className={'file-list'}>
        <ListView data={props.site.get('files')}
                  renderer={renderFile}
                  selected={selected}
                  onSelect={(e) => setSelected(e)}
        />
        {/*{props.site.get('files').map(file => {*/}
        {/*    return <div key={file.id()}>*/}
        {/*        {file.get('fileName').get()}*/}
        {/*    </div>*/}
        {/*})}*/}
    </div>
}

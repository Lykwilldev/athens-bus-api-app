import "./Popup.css"

interface PopupProperties{
    RouteNames: String[];
    PopupToggle: (value:boolean) =>  void;
    RouteIndex: (value:number) => void;
}



function Popup({RouteNames, PopupToggle,RouteIndex}: PopupProperties) {
    return (
        <div className = "popupBackground">
            <div className = "popupContainer">
                <h2>Select route</h2>
                {RouteNames.map((route:any,index)=>(
                    <div key={index}>
                        <button onClick = {() => {PopupToggle(false);RouteIndex(index)}}>{route}</button>
                    </div>
                ))}

            </div>

        </div>
        
    )
} export default Popup
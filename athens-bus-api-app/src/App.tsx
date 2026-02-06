import { useState, useEffect } from 'react'
import axios from 'axios'
import routeMap from './route_mapping.json'
import React from 'react';
import Popup from './Components/Popup'
// interface RouteInfo {
//   RouteCode: string;
//   LineCode: string;
//   RouteDescr: string;
//   RouteDescrEng: string;
//   RouteType: string;
//   RouteDistance: string;
// }

// Used a js script to import required data from the busses in the athenian network and arrange them 
// in this JSON file, which we import above
const typedRouteMap = routeMap as Record<string, { lineCode: number | string, lineID: string, lineDescr: string, lineDescrEng: string }>;
interface StopLines {
  route_code: string;
  veh_code: string;
  btime2: string;
  index: string;
}

interface StopsInfo {
  StopCode: string;
  StopID: string;
  StopDescr: string;
  StopDescrEng: string;
  StopStreet: string;
  StopStreetEng: string;
  StopHeading: string;
  StopLat: string;
  StopLng: string;
  RouteStopOrder: string;
  StopType: string;
  StopAmea: string;
  index: string;
}


interface BusLine {
  lineCode: number | string;
  lineID: string;
  lineDescr: string;
  lineDescrEng: string;
}



function App() {
  const [busInfo, setBusInfo] = useState<BusLine[]>([])
  const [selectedLineCode, setSelectedLineCode] = useState<string>("")
  const [routeStops, setrouteStops] = useState<StopsInfo[][]>([])
  const [stopLines, setstopLines] = useState<StopLines[]>([])
  const [selectedStop, setSelectedStop] = useState<string>("")
  const [routeDescritpion, setrouteDescription] = useState<String[]>([])
  const [selectedRoute,setselectedRoute] = useState<number>(0)
  const [popupToggle,setpopupToggle] = useState<boolean>(false)


  useEffect(() => {
    // Recieves bus data for all the busses in the Athens/Attica network from json file
    // Sorts them and places them into a state variable in an array of string form with the above type/properties



    const allRoutes = Object.values(typedRouteMap)
    const uniqueMap = new Map()

    allRoutes.forEach((route) => {
      const Code = String(route.lineCode)

      uniqueMap.set(Code, {
        lineCode: Code,
        lineID: route.lineID,
        lineDescr: route.lineDescr,
        lineDescrEng: route.lineDescrEng
      })


    })
    const cleanList = Array.from(uniqueMap.values()) as BusLine[];



    cleanList.sort((a, b) =>
      a.lineID.localeCompare(b.lineID, undefined, { numeric: true })
    );


    setBusInfo(cleanList);



    if (cleanList.length > 0) {
      setSelectedLineCode(String(cleanList[0].lineCode));
    }



  }, [])


  // To get each bus' stops we need the RouteCode variable, which we get using this api call
  // Bus lines have from 1 to 3 routecodes, depending on how many routes they take
  const GetRoutecode = async () => {
    let Routes: String[] = []
    let RouteDescrs: String[] = []
    setpopupToggle(true)
    try {

      const res = await axios.get(`/api/?act=webGetRoutes&p1=${selectedLineCode}`)
      
      console.log(res.data)

      res.data.forEach((route: any) => {
        Routes.push(route.RouteCode)
        RouteDescrs.push(route.RouteDescr)
      })

      console.log(RouteDescrs)
      setrouteDescription(RouteDescrs)
      GetStops(Routes)



    } catch (err) {
      alert("Failed to get routecode")
    }

  }

  // Using the routecode/s from the above function, we look it up using this api call and get the route (all the stops and direction of the bus)
  // as well as the coordinates of each stop to be displayied on a map 
  const GetStops = async (Routecodes: String[]) => {

    try {
      const requests = Routecodes.map(async (route: any) => {
        const res = await axios.get(`/api/?act=webGetRoutesDetailsAndStops&p1=${route}`)
        

        return res.data.stops


      })
      const routes = await Promise.all(requests)

      console.log(routes)
      setrouteStops(routes)

    } catch { alert(`Failed to get Stops for routecode/s ${Routecodes}`) }



  }

  // Now for the stop the user selects, we use an api call to get which busses pass from that stop as well as 
  // the time remaining for the bus arival

  const GetStopInfo = async (e: React.MouseEvent<HTMLAnchorElement>, stopCode: string) => {
    e.preventDefault()

    const res = await axios.get(`/api/?act=getStopArrivals&p1=${stopCode}`)
   


    console.log(res.data)
    setSelectedStop(stopCode)
    setstopLines(res.data)
    console.log(selectedStop)


  }





  return (
    <>
     { popupToggle  && <Popup RouteNames = {routeDescritpion} PopupToggle = {setpopupToggle} RouteIndex={setselectedRoute} />} {/*Give route description and toggler*/}
      <h1>Καλως ήρθες</h1>
      <img src={"/oasa.svg"} alt="oasa logo" style={{ width: '150px' }} />
      <h4>Επίλεξε διαδρομή</h4>
      {busInfo && busInfo.length > 0 ? (
        <>

          <select onChange={(e) => setSelectedLineCode(e.target.value)}>

            {busInfo.map((bus) => (
              <option key={bus.lineCode} value={bus.lineCode}>
                {bus.lineID}: {bus.lineDescr}
              </option>
            ))}

          </select>
          <input type="submit" value="Επιλογή" onClick={GetRoutecode} />



          {/* {routeStops.map((route: any, index) => ( ))} */}
          {routeStops.length > 0 && routeStops[0] && (
            <div className="route-section">
             
             
              
              <h3>Διαδρομή </h3>
              
            

              <ul>
                {routeStops[selectedRoute].map((stop: any) => (
                  <li key={stop.StopCode}>
                    <a href="#" onClick={(e) => GetStopInfo(e, stop.StopCode)}>
                      {stop.StopDescr}
                    </a>
                    


                    {selectedStop === stop.StopCode && (
                      <div>

                        {stopLines && stopLines.length > 0 ? (

                          <ul>

                            {stopLines.map((line, idx) => {
                              const info = typedRouteMap[line.route_code];
                              // info contains all the routecodes mapped to be alligned with linecodes, line descriptions and ids "routecode -> linecode -> Α1 ΠΕΙΡΑΙΑΣ-ΒΟΥΛΑ, PEIRAIAS-VOULA"
                               

                              return (
                                <li key={`${line.route_code}-${idx}`}>
                                  <b>

                                    {info ? info.lineID : line.route_code}{" "}
                                    {info ? info.lineDescr : ""}
                                  </b>
                                  : <span> {line.btime2}'</span>
                                </li>
                              );
                            })}

                          </ul>
                        ) : (

                          <p>
                            <b>Δεν βρέθηκαν λεωφορεία</b>
                          </p>
                        )}

                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>)}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}

export default App

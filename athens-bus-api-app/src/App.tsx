import { useState, useEffect } from 'react'
import axios from 'axios'

// interface RouteInfo {
//   RouteCode: string;
//   LineCode: string;
//   RouteDescr: string;
//   RouteDescrEng: string;
//   RouteType: string;
//   RouteDistance: string;
// }
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
  LineCode: string;
  LineID: string;
  LineDescr: string;
  LineDescrEng: string;
}



function App() {
  const [busInfo, setBusInfo] = useState<BusLine[]>([])
  const [selectedLineCode, setSelectedLineCode] = useState<string>("")
  const [routeStops, setrouteStops] = useState<StopsInfo[]>([])
  const [stopLines, setstopLines] = useState<StopLines[]>([])
  const [selectedStop, setSelectedStop] = useState<string>("")

  useEffect(() => {
    // Recieves bus data for all the busses in the Athens/Attica network
    // Places them into a state variable in an array of string form with the above type/properties
    const GetBusLines = async () => {
      try {
        const res = await axios.get("/api/?act=webGetLines")

        setBusInfo(res.data)

        if (res.data && res.data.length > 0) {
          setSelectedLineCode(res.data[0].LineCode)
        }
      } catch (err) {
        console.error(err)
        alert("Error fetching bus lines")
      }
    }
    GetBusLines()
  }, [])


  // To get each bus' stops we need the RouteCode variable, which we get using this api call
  // Bus lines have from 1 to 3 routecodes, depending on how many routes they take
  const GetRoutecode = async () => {
    try {

      const res = await axios.get(`/api/?act=webGetRoutes&p1=${selectedLineCode}`)
      console.log(res.data)


      const RouteCodeGo = res.data[0].RouteCode

      console.log(RouteCodeGo)


      GetStops(RouteCodeGo)



    } catch (err) {
      alert("Failed to get routecode")
    }

  }

  // Using the routecode/s from the above function, we look it up using this api call and get the route (all the stops and direction of the bus)
  // as well as the coordinates of each stop to be displayied on a map 
  const GetStops = async (RouteCodeGo: string) => {
    try {
      const res = await axios.get(`/api/?act=webGetRoutesDetailsAndStops&p1=${RouteCodeGo}`)
      setrouteStops(res.data.stops)
      console.log("In GetStops")
      console.log(res.data)

    } catch (err) {
      alert("Failed to get stops")
    }
  }

  // Now for the stop the user selects, we use an api call to get which busses pass from that stop as well as 
  // the time remaining for the bus arival

  const GetStopInfo = async (e: React.MouseEvent<HTMLAnchorElement>, stopCode: string) => {
    e.preventDefault()

    const res = await axios.get(`/api/?act=getStopArrivals&p1=${stopCode}`)
    // Find a way to display line numbers using routecode, given by above api call
    console.log(res.data)
    setSelectedStop(stopCode)
    setstopLines(res.data)
    console.log(selectedStop)


  }





  const GetLineName = async () => {
    const res = await axios.get(`api/?act=getLineName&p1=${selectedLineCode}`)
    return (res.data.line_descr)


  }

  return (
    <>
      <h1>Καλως ήρθες</h1>
      <img src={"/oasa.svg"} alt="oasa logo" style={{ width: '150px' }} />
      <h4>Επίλεξε διαδρομή</h4>
      {busInfo && busInfo.length > 0 ? (
        <>

          <select onChange={(e) => setSelectedLineCode(e.target.value)}>

            {busInfo.map((bus) => (
              <option key={bus.LineCode} value={bus.LineCode}>
                {bus.LineID}: {bus.LineDescr}
              </option>
            ))}

          </select>
          <input type="submit" value="Επιλογή" onClick={GetRoutecode} />


          {routeStops &&
            <>
              <ul>
                {
                  routeStops.map((stop) => (<>

                    <li key={stop.index}><a href="" onClick={(e) => GetStopInfo(e, stop.StopCode)}>{stop.StopDescr}</a></li>
                    {selectedStop === stop.StopCode && stopLines && stopLines.map((line) => (
                      <ul key={line.index}>
                        <li>
                          {line.route_code}: {line.btime2} mins
                        </li>

                      </ul>

                    ))}
                  </>
                  ))
                }
              </ul>
            </>
          }
        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}

export default App

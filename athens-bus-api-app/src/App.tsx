import { useState, useEffect } from 'react'
import axios from 'axios'

interface RouteDetails {
  RouteCode: string;
  LineCode: string;
  RouteDescr: string;
  RouteDescrEng: string;
  RouteType: string;
  RouteDistance: string;
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
  const [routeResults, setRouteResults] = useState<RouteDetails[]>([])

  useEffect(() => {
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

  const GetStops = async (RouteCodeGo: string) => {
    try {
      const res = await axios.get(`/api/?act=webGetRoutesDetailsAndStops&p1=${RouteCodeGo}`)
      console.log(res.data)

    } catch (err) {
      alert("Failed to get stops")
    }
  }

  return (
    <>
      <h1>Καλως ήρθες</h1>
      <img src={"/oasa.svg"} alt="oasa logo" style={{ width: '150px' }} />
      <h4>Επίλεξε διαδρομή</h4>
      {busInfo && busInfo.length > 0 ? (
        <>
          <h4>Επίλεξε διαδρομή</h4>
          <select

            onChange={(e) => setSelectedLineCode(e.target.value)}
          >
            {busInfo.map((bus) => (
              <option key={bus.LineCode} value={bus.LineCode}>
                {bus.LineID}: {bus.LineDescr}
              </option>
            ))}
          </select>
          <input type="submit" value="Επιλογή" onClick={GetRoutecode} />



        </>
      ) : (
        <p>Loading...</p>
      )}
    </>
  )
}

export default App

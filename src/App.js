import { data } from './data'
import { data2 } from './data2'
import Printers from './Printers'

function App() {
  return (
    <div className="App bg-stone-100 w-screen h-screen">
      <p className='text-stone-800 text-4xl text-center pt-20'><b>Printers Data Visualization Test</b></p>
      <Printers data={data2} />
    </div>
  )
}

export default App

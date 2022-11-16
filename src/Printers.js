import React from 'react'
import Printer from './Printer'
import moment from 'moment'

moment.locale('fr')

const Printers = ({ data }) => {
    const printerList = data.reduce((printers, item) => ({
        ...printers,
        [item.serial]: [...(printers[item.serial] || []), item]
      }), {})
    const printers = Object.values(printerList)

    return (
        <div className='w-full flex flex-wrap justify-center my-12'>
            {printers.map((printer, i) => <Printer key={i} printer={printer} />)}
        </div>
    )
}

export default Printers



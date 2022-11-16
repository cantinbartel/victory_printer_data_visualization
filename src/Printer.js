import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { VictoryBar, VictoryChart, VictoryTooltip, VictoryAxis, VictoryZoomContainer, VictoryBrushContainer, VictoryLine } from 'victory'

const Printer = ({ printer }) => {
  const [dataState, setDataState] = useState([])
  const [zoomDomain, setZoomDomain] = useState({ x: [] })

  console.log('rerender')

  useEffect(() => {
    let initializations = []
    let data = []
    printer.map(p => {
      initializations.push({
        created: moment(p?.status?.uptime).format('DD/MM H:mm'),
        x: new Date(p?.status?.uptime),
        remaining: p.remaining,
        status: 'initialization',
        y: 400
      })
    })
    initializations.filter(el => {
      if (!data.includes(el.created) || !data.includes(el.x)) {
        data.push(el)
        return true
      }
      return false
    })
    printer.map(p => {
      const information = {
        created: moment(p?.created_at).format('DD/MM H:mm'),
        x: new Date(p?.created_at),
        remaining: p.remaining,
        status: p?.status?.status || 'undefined status',
        y: 400
      }
      if (p.status.status != undefined && (p.status.status.includes('Printing') || p.status.status.includes('Idle'))) {
        data.push({ ...information, y: p.remaining, remaining: p.remaining })
      } else {
        data.push({ ...information, remaining: p.remaining })
      }
    })
    // data = data.sort((a, b) => a.x - b.x).filter(d => moment(data[data.length - 1].x).format('x')) -- For the whole period of time
    // 16,000,000,000 = 6 months
    data = data.sort((a, b) => a.x - b.x).filter(d => moment(data[data.length - 1].x).format('x') - moment(d.x).format('x') < 16000000000)
    setDataState(data)
    const startDate = data[0].x
    const dtInMs = moment(data[data.length - 1].x).format('x') - moment(startDate).format('x')
    if (dtInMs >= 360000000) {
      // if dt >= 100h (360,000,000 ms) => set time slot to 5%
      const hourlyRange = ((dtInMs / 100) * 5) / 3600000
      const rangeAddedToStartDate = setHourRange(startDate, hourlyRange)
      setZoomDomain(data.length > 0 ? { x: [startDate, rangeAddedToStartDate] } : { x: [] })
    } else if (dtInMs >= 14400000 && dtInMs < 360000000) {
      // 14,400,000 milliseconds == 4 hours & 360,000,000 milliseconds == 100h
      const rangeAddedToStartDate = setHourRange(startDate, 4)
      setZoomDomain(data.length > 0 ? { x: [startDate, rangeAddedToStartDate] } : { x: [] })
    } else {
      setZoomDomain(data.length > 0 ? { x: [startDate, data[data.length - 1].x] } : { x: [] })
    }
  }, [])
  const handleZoom = (domain) => {
    if (moment(dataState[dataState.length - 1].x).format('x') - moment(dataState[0].x).format('x') > 14400000) {
      setZoomDomain(domain)
    }
  }
  function setHourRange(date, hours) {
    const newDate = new Date(date)
    newDate.setHours(date.getHours() + hours)
    return newDate
  }

  return (
    <div className='w-5/12 flex flex-col items-center bg-white m-6 rounded shadow-md'>
      <div className='text-center mt-8'>
        <p><b>{printer[0].serial || 'Unknown Printer'}</b></p>
      </div>
      <div className='w-full -mt-12'>
        <VictoryChart
          domainPadding={20}
          scale={{ x: 'time' }}
          domain={{ y: [0, 400] }}
          containerComponent={
            <VictoryZoomContainer
              allowZoom={false}
              zoomDomain={zoomDomain}
              onZoomDomainChange={(domain) => handleZoom(domain)} />
          }>
          <VictoryBar
            data={dataState}
            events={[{
              eventHandlers: {
                onMouseEnter: () => (
                  [
                    {
                      mutation: (props) => ({
                        style: Object.assign(
                          {},
                          props.style,
                          {
                            fill: (d) => d?.datum.status.includes('initialization')
                              ? 'rgb(21 128 61)'
                              : (d?.datum.status.includes('Printing') || d?.datum.status.includes('Idle'))
                                ? '#57534e'
                                : 'rgb(159 18 57)'
                          }
                        )
                      })
                    }
                  ]
                ),
                onMouseLeave: () => (
                  [
                    {
                      target: 'data',
                      mutation: () => null
                    }
                  ]
                )
              }
            }]}
            labels={(d) => (
              `${d.datum.created}
              ${d.datum.status}
              ${d.datum.remaining}
            `)
            }
            barWidth={1}
            labelComponent={
              <VictoryTooltip
                pointerOrientation="bottom"
                pointerLength={0}
                width={120}
                y={180}
                padding={0}
                cornerRadius={10}
                flyout='center'
                style={{
                  fill: '#868C97',
                  fontSize: 16,
                  fontWeight: 500,
                  textAnchor: 'middle'
                }}
                flyoutPadding={{ top: 10, right: -5, bottom: -10, left: -5 }}
                flyoutStyle={{
                  stroke: 'none',
                  fill: '#fff',
                  filter: 'drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.4))',
                  y: 20
                }} />
            }
            style={{
              data: {
                fill: (d) => d?.datum.status.includes('initialization')
                  ? 'rgb(74 222 128)'
                  : (d?.datum.status.includes('Printing') || d?.datum.status.includes('Idle'))
                    ? '#d6d3d1'
                    : 'rgb(244 63 94)'
              }
            }} />
          <VictoryAxis
            scale={{ x: 'time' }}
            style={{ axis: { stroke: '#6b7280' } }} />
          <VictoryAxis
            dependentAxis
            style={{ axis: { stroke: '#6b7280' } }} />
        </VictoryChart>
      </div>
      <div className='w-full mb-6 -mt-4'>
        <VictoryChart
          padding={{ top: 10, left: 50, right: 50, bottom: 30 }}
          height={100}
          domain={{ y: [0, 400] }}
          scale={{ x: 'time' }}
          containerComponent={
            <VictoryBrushContainer
              allowZoom={false}
              allowResize={false}
              brushDimension="time"
              brushDomain={zoomDomain}
              brushStyle={{fill: '#78716c', opacity: 0.2}}
              onBrushDomainChange={(domain) => handleZoom(domain)}
              allowDrag={moment(dataState[dataState.length - 1]?.x).format('x') - moment(dataState[0]?.x).format('x') > 14400000} />
          }>
          <VictoryLine
            x="x"
            y="remaining"
            interpolation="linear"
            data={dataState}
            style={{ data: { stroke: '#57534e' } }} />
          <VictoryAxis
            scale={{ x: 'time' }}
            style={{ axis: { stroke: '#6b7280' } }} />
          <VictoryAxis
            dependentAxis
            style={{ axis: { stroke: '#6b7280' } }} />
        </VictoryChart>
      </div>
    </div>
  )
}

export default Printer

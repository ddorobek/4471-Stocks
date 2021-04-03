import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';



const TrackerBase = (props) => {
    const { tickerValue, stock, tickerCompareValue, stockCompare, openComparer , startDate, endDate} = { ...props }
    let stockData = openComparer ? [{ name: 'first', data: stock }, { name: 'second', data: stockCompare }] : stock.message
    console.log(stockData)
    let xAxis = "date"

    if(startDate == endDate)
    {
        xAxis = "time"
    }

    return (
        <>
            <div className="GraphContainer">
                <p>{tickerValue ? tickerValue.toUpperCase() : null} Stock</p>
                <LineChart
                    title={tickerValue ? tickerValue.toUpperCase() : null}
                    width={700}
                    height={400}
                    style={{ backgroundColor: 'white' }}
                    data={openComparer ? undefined : stockData}
                    margin={{
                        top: 5,
                        right: 5,
                        left: 5,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid />
                    <XAxis dataKey={xAxis} domain={['dataMin', 'dataMax']} tick={{ fontSize: '12' }} />
                    <YAxis dataKey="price" domain={['dataMin', 'dataMax']} tick={{ fontSize: '12' }} />
                    <Tooltip />
                    <Legend />
                    {openComparer
                        ? stockData.map((s) => (
                            <Line dataKey="price" data={s.data} key={s.name} name={s.name}  />
                        ))
                        : <Line type="monotone" name="Price" dataKey="price" stroke="#8884d8" activeDot={{ r: 1 }} />
                    }
                    
                    {/*<Line type="monotone" dataKey="uv" stroke="#82ca9d" />*/}
                </LineChart>
            </div>
        </>
    )
}

export default TrackerBase;
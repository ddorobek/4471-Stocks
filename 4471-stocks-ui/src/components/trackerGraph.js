import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';



const TrackerGraph = (props) => {
    const { tickerValue, stock, tickerCompareValue, tickerCompany1, tickerCompany2, stockCompare, openComparer , startDate, endDate} = { ...props }
    let stockData = openComparer ? [{ name: tickerCompany1, data: stock }, { name: tickerCompany2, data: stockCompare }] : stock.message
    console.log(stockData)
    let xAxis = "date"

    if(startDate == endDate)
    {
        xAxis = "time"
    }

    return (
    <>
        <div className="GraphContainer">
            {openComparer ? <p>{tickerValue ? tickerCompany1 +" Vs. "+tickerCompany2 : null} Stock</p> : <p>{tickerValue ? tickerValue.toUpperCase()+" - "+tickerCompany1 : null} Stock</p> }
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
                <XAxis dataKey={xAxis} tick={{ fontSize: '12' }} type="category" allowDuplicatedCategory={openComparer == true ? false : true}/>
                <YAxis dataKey="price" domain={[dataMin => Math.ceil(dataMin-1), 'dataMax']} tick={{ fontSize: '12' }} type="number" />
                <Tooltip />
                <Legend />
                {openComparer
                    ? stockData.map((s) => (
                        <Line dataKey="price" data={s.data} key={s.name} name={s.name}  />
                    ))
                    : <Line type="monotone" name={tickerCompany1} dataKey="price" stroke="#8884d8" activeDot={{ r: 1 }} /> 
                }
                    
            </LineChart>
        </div>
    </>
    )
 
}

export default TrackerGraph;
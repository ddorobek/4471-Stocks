import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../App.css';



const TrackerBase = (props) => {
    const { tickerValue, stock } = {...props }
    return (
        <div className="GraphContainer">
            <p>{tickerValue ? tickerValue.toUpperCase() : null} Stock</p>
            <LineChart
                title={tickerValue ? tickerValue.toUpperCase() : null}
                width={700}
                height={400}
                style={{ backgroundColor: 'white' }}
                data={stock.message}
                margin={{
                    top: 5,
                    right: 5,
                    left: 5,
                    bottom: 5,
                }}
            >
                <CartesianGrid />
                <XAxis dataKey="time" domain={['dataMin', 'dataMax']} tick={{ fontSize: '12' }} />
                <YAxis dataKey="price" domain={['dataMin', 'dataMax']} tick={{ fontSize: '12' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" name="Price" dataKey="price" stroke="#8884d8" activeDot={{ r: 1 }} />
                {/*<Line type="monotone" dataKey="uv" stroke="#82ca9d" />*/}
            </LineChart>
        </div>
    )
}

export default TrackerBase;
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const TrackerBase = (props) => {
    const { tickerValue, stock } = {...props }
    return (
        <>
            <p>{tickerValue.toUpperCase()} Stock</p>
            <LineChart
                title={tickerValue.toUpperCase()}
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
            <br />
            <br />

        </>
    )
}

export default TrackerBase;
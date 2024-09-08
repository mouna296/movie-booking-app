import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { AuthContext } from '../context/AuthContext';

const DateSelector = ({ selectedDate, setSelectedDate }) => {
    const { auth } = useContext(AuthContext);
    const wrapperRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [dates, setDates] = useState([]);

    const handlePrevDay = () => {
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);
        setSelectedDate(prevDay);
    };

    const handleNextDay = () => {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedDate(nextDay);
    };

    const handleCurrentDate = () => {
        setSelectedDate(new Date());
        setIsEditing(false); 
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const DateShort = ({ date }) => {
        const isThisDate =
            selectedDate.getDate() === date.getDate() &&
            selectedDate.getMonth() === date.getMonth() &&
            selectedDate.getFullYear() === date.getFullYear();

        return (
            <button
                className={`flex items-center justify-center rounded p-1 font-semibold focus:outline-none ${
                    isThisDate ? 'bg-red-500 text-white' : 'text-black'
                } bg-gray-500 hover:bg-gray-600 shadow-md transition duration-300 ease-in-out transform hover:scale-105`}
                onClick={() => {
                    setSelectedDate(date);
                    setIsEditing(false);
                }}
            >
                {formatDate(date)}
            </button>
        );
    };

    useEffect(() => {
        const today = new Date();
        const weekDates = [];
        for (let i = -3; i < 4; i++) {
            const newDate = new Date(today);
            newDate.setDate(selectedDate.getDate() + i);
            weekDates.push(newDate);
        }
        setDates(weekDates);
    }, [selectedDate]);

    return (
        <div className="flex flex-col gap-2 items-center">
        
            <div className="flex items-center justify-between gap-2 rounded-md bg-gray-200 p-2 font-semibold w-full">
                <button onClick={handlePrevDay} className="hover:bg-gray-300 rounded-full p-1">
                    <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                </button>
                <div className="text-lg w-24 text-center">{formatDate(selectedDate)}</div>
                <button onClick={handleNextDay} className="hover:bg-gray-300 rounded-full p-1">
                    <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                </button>
                <button onClick={handleCurrentDate} className="hover:bg-gray-300 rounded-full p-1">
                    Current Date
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto items-center justify-center w-full">
                {dates.map((date, index) => (
                    <DateShort key={index} date={date} />
                ))}
            </div>
        </div>
    );
};

export default DateSelector;

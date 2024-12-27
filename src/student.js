import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import contractABI from './contractABI.json'; 

const web3 = new Web3(window.ethereum);

const StudentPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [contract, setContract] = useState(null);

    const contractAddress = "0xbBa14ADcBaB600F866428C4Dd8BF4d6003f8BA08";

    useEffect(() => {
        if (window.ethereum) {
            // Request accounts from MetaMask
            window.ethereum.request({ method: 'eth_requestAccounts' }).then((accounts) => {
                setAccounts(accounts);
                setSelectedAccount(accounts[0]); // Set the first account as default
            }).catch((error) => {
                console.error("Error fetching accounts:", error);
            });

            // Initialize contract
            const tempContract = new web3.eth.Contract(contractABI, contractAddress);
            setContract(tempContract);
        } else {
            console.error("MetaMask is not installed.");
        }
    }, []);

    const handleAccountChange = (event) => {
        setSelectedAccount(event.target.value);  // Set the selected account
    };

    const fetchSchedule = async () => {
        if (!selectedAccount || !contract) return;
    
        try {
            // Call the contract method to get the student's schedule
            const studentSchedule = await contract.methods.getStudentSchedule(selectedAccount).call();
    
            console.log("Fetched Student Schedule:", studentSchedule);  // Log the response to check its structure
    
            // If the data is returned, format and set the schedule
            const formattedSchedule = studentSchedule.map((lecture) => ({
                lectureID: lecture.lectureID.toString(),  // Convert BigNumber to string
                className: lecture.className,
                lectureTime: lecture.lectureTime,
            }));
    
            setSchedule(formattedSchedule);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        }
    };    

    return (
        <div className='container'>
            <h1 className="title">Student Page</h1>
            <div>
                <label>Select your account:</label>
                <select onChange={handleAccountChange} value={selectedAccount}>
                    {accounts.map((account, index) => (
                        <option key={index} value={account}>
                            {account}
                        </option>
                    ))}
                </select>
            </div>
            <button className='action-button' onClick={fetchSchedule}>Fetch Schedule</button>
            <div>
                <h2>Your Schedule</h2>
                <ul>
                    {schedule.length === 0 ? (
                        <li>No schedule found</li>
                    ) : (
                        schedule.map((lecture, index) => (
                            <li key={index}>
                                {lecture.className} - {lecture.lectureTime}
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default StudentPage;

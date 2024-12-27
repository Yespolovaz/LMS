import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const LMS = () => {
    // Original state variables
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [isOwner, setIsOwner] = useState(null);
    const [studentID, setStudentID] = useState('');
    const [studentName, setStudentName] = useState('');
    const [lectureID, setLectureID] = useState('');
    const [currentLectureID, setCurrentLectureID] = useState('');
    const [studentRecords, setStudentRecords] = useState([]);
    const [studentsForLecture, setStudentsForLecture] = useState([]);
    const [lectureTitle, setLectureTitle] = useState('');
    const [lectureDescription, setLectureDescription] = useState('');
    const [lectureIPFSHash, setLectureIPFSHash] = useState('');
    const [currentLecture, setCurrentLecture] = useState(null);

    const contractAddress = "0xa7e5203b5b9f6290ed4386ae7555c3e60202b692";

    // Updated ABI to include new lecture-related functions
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "lectureID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "className",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "lectureTime",
                    "type": "string"
                }
            ],
            "name": "addLecture",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "studentID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "studentName",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "lectureID",
                    "type": "uint256"
                }
            ],
            "name": "addRecord",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "provider",
                    "type": "address"
                }
            ],
            "name": "authorizeProvider",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "getAllLectures",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "lectureID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "className",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "lectureTime",
                            "type": "string"
                        }
                    ],
                    "internalType": "struct StudentsRecords.Lecture[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "lectureID",
                    "type": "uint256"
                }
            ],
            "name": "getLecture",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "lectureID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "className",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "lectureTime",
                            "type": "string"
                        }
                    ],
                    "internalType": "struct StudentsRecords.Lecture",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "studentID",
                    "type": "uint256"
                }
            ],
            "name": "getStudentRecords",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "recordID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "StudentName",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "lectureID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct StudentsRecords.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "lectureID",
                    "type": "uint256"
                }
            ],
            "name": "getStudentsByLecture",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "recordID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "StudentName",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "lectureID",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        }
                    ],
                    "internalType": "struct StudentsRecords.Record[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "lectureCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "lectures",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "lectureID",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "className",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "lectureTime",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    useEffect(() => {
        const connectWallet = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send('eth_requestAccounts', []);
                const signer = provider.getSigner();
                setProvider(provider);
                setSigner(signer);

                const accountAddress = await signer.getAddress();
                setAccount(accountAddress);

                console.log(accountAddress);

                const contract = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(contract);

                const ownerAddress = await contract.getOwner();
                setIsOwner(accountAddress.toLowerCase() === ownerAddress.toLowerCase());

            } catch (error) {
                console.error("Error connecting to wallet: ", error);
            }
        };
        connectWallet();
    }, []);

    const fetchStudentRecords = async () => {
        try {
            const records = await contract.getStudentRecords(studentID);
            const formattedRecords = records.map(record => ({
                recordID: record.recordID.toNumber(),
                studentName: record.StudentName,
                lectureID: record.lectureID.toNumber(),
                timestamp: new Date(record.timestamp.toNumber() * 1000).toLocaleString()
            }));
            setStudentRecords(formattedRecords);
        } catch (error) {
            console.error("Error fetching student records: ", error);
        }
    };

    const addStudentRecord = async () => {
        try {
            const tx = await contract.addRecord(studentID, studentName, lectureID);
            await tx.wait();
            fetchStudentRecords();
            alert("Student record added successfully");
        } catch (error) {
            console.error("Error adding student record: ", error);
        }
    };    

    const fetchStudentsForLecture = async () => {
        try {
            const records = await contract.getStudentRecords(lectureID);
            const filteredRecords = records.filter(record => record.lectureID === parseInt(currentLectureID));
            setStudentsForLecture(filteredRecords);
        } catch (error) {
            console.error("Error fetching students for lecture: ", error);
        }
    };
    

    // const authorizeProvider = async () => {
    //     if (isOwner) {
    //         try {
    //             const tx = await contract.authorizeProvider(providerAddress);
    //             await tx.wait();
    //             alert(`Provider ${providerAddress} authorized successfully`);
    //         } catch(error) {
    //             console.error("Error authorizing provider", error);
    //         }
    //     } else {
    //         alert("Only contract owner can call this function");
    //     }
    // };

    // New functions for lecture management
    const authorizeLecturer = async () => {
        if (isOwner) {
            try {
                const tx = await contract.authorizeLecturer(lecturerAddress);
                await tx.wait();
                alert(`Lecturer ${lecturerAddress} authorized successfully`);
            } catch(error) {
                console.error("Error authorizing lecturer", error);
            }
        } else {
            alert("Only contract owner can authorize lecturers");
        }
    };

    const addLecture = async () => {
        try {
            const tx = await contract.addLecture(lectureTitle, lectureDescription, lectureIPFSHash);
            await tx.wait();
            alert("Lecture added successfully");
            // Clear form
            setLectureTitle('');
            setLectureDescription('');
            setLectureIPFSHash('');
        } catch(error) {
            console.error("Error adding lecture", error);
        }
    };

    const fetchLecture = async () => {
        try {
            const lecture = await contract.getLecture(lectureID);
            setCurrentLecture({
                title: lecture[0],
                description: lecture[1],
                ipfsHash: lecture[2],
                presenter: lecture[3],
                timestamp: lecture[4].toNumber(),
                isActive: lecture[5]
            });
        } catch(error) {
            console.error("Error fetching lecture", error);
        }
    };

    return (
        <div className='container'>
            <h1 className="title">Learning Management System</h1>
            {account && <p className='account-info'>Connected Account: {account}</p>}
            {isOwner && <p className='owner-info'>You are the contract owner</p>}

            <div className="form-section">
                <h2>Add Student Record</h2>
                <input
                    className='input-field'
                    type='text'
                    placeholder='Student ID'
                    value={studentID}
                    onChange={(e) => setStudentID(e.target.value)}
                />
                <input
                    className='input-field'
                    type='text'
                    placeholder='Student Name'
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                />
                <input
                    className='input-field'
                    type='text'
                    placeholder='Lecture ID'
                    value={lectureID}
                    onChange={(e) => setLectureID(e.target.value)}
                />
                <button className='action-button' onClick={addStudentRecord}>
                    Add Record
                </button>
            </div>

            {/* <div className="form-section">
                <h2>Authorize Healthcare Provider</h2>
                <input 
                    className='input-field' 
                    type="text" 
                    placeholder='Provider Address' 
                    value={providerAddress} 
                    onChange={(e) => setProviderAddress(e.target.value)}
                />
                <button className='action-button' onClick={authorizeProvider}>
                    Authorize Provider
                </button>
            </div> */}

            {/* New Lecture Management Forms */}
            {isOwner && (
                <div className="form-section">
                    <h2>Authorize Lecturer</h2>
                    <input 
                        className='input-field' 
                        type="text" 
                        placeholder='Lecturer Address' 
                        value={lecturerAddress} 
                        onChange={(e) => setLecturerAddress(e.target.value)}
                    />
                    <button className='action-button' onClick={authorizeLecturer}>
                        Authorize Lecturer
                    </button>
                </div>
            )}

            <div className="form-section">
                <h2>Add Lecture</h2>
                <input 
                    className='input-field' 
                    type="text" 
                    placeholder='Lecture Title' 
                    value={lectureTitle} 
                    onChange={(e) => setLectureTitle(e.target.value)}
                />
                <input 
                    className='input-field' 
                    type="text" 
                    placeholder='Lecture Description' 
                    value={lectureDescription} 
                    onChange={(e) => setLectureDescription(e.target.value)}
                />
                <input 
                    className='input-field' 
                    type="text" 
                    placeholder='IPFS Hash' 
                    value={lectureIPFSHash} 
                    onChange={(e) => setLectureIPFSHash(e.target.value)}
                />
                <button className='action-button' onClick={addLecture}>
                    Add Lecture
                </button>
            </div>

            <div className="form-section">
                <h2>Fetch Lecture</h2>
                <input 
                    className='input-field' 
                    type="text" 
                    placeholder='Lecture ID' 
                    value={lectureID} 
                    onChange={(e) => setLectureID(e.target.value)}
                />
                <button className='action-button' onClick={fetchLecture}>
                    Fetch Lecture
                </button>
            </div>

            <div className='form-section'>
                <h2>List Students for Lecture</h2>
                <input
                    className='input-field'
                    type='text'
                    placeholder='Enter Lecture ID'
                    value={currentLectureID}
                    onChange={(e) => setCurrentLectureID(e.target.value)}
                />
                <button className='action-button' onClick={fetchStudentsForLecture}>
                    List Students
                </button>
            </div>

            <div className='records-section'>
                <h2>Students for Lecture</h2>
                {studentsForLecture.map((student, index) => (
                    <div key={index} className='record-card'>
                        <p>Student Name: {student.studentName}</p>
                        <p>Lecture ID: {student.lectureID}</p>
                    </div>
                ))}
            </div>

            <div className='form-section'>
                <h2>Fetch Student Records</h2>
                <input
                    className='input-field'
                    type='text'
                    placeholder='Enter Student ID'
                    value={studentID}
                    onChange={(e) => setStudentID(e.target.value)}
                />
                <button className='action-button' onClick={fetchStudentRecords}>
                    Fetch Records
                </button>
            </div>

            {/* Display Sections */}
            {/* <div className='records-section'>
                <h2>Patient Records</h2>
                {patientRecords.map((record, index) => (
                    <div key={index} className="record-card">
                        <p>Record ID: {record.recordID.toNumber()}</p>
                        <p>Diagnosis: {record.diagnosis}</p>
                        <p>Treatment: {record.treatment}</p>
                        <p>Timestamp: {new Date(record.timestamp.toNumber() * 1000).toLocaleString()}</p>
                    </div>
                ))}
            </div> */}

            {currentLecture && (
                <div className='lecture-section'>
                    <h2>Current Lecture</h2>
                    <div className="lecture-card">
                        <p>Title: {currentLecture.title}</p>
                        <p>Description: {currentLecture.description}</p>
                        <p>IPFS Hash: {currentLecture.ipfsHash}</p>
                        <p>Presenter: {currentLecture.presenter}</p>
                        <p>Timestamp: {new Date(currentLecture.timestamp * 1000).toLocaleString()}</p>
                        <p>Status: {currentLecture.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LMS;
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from "./contractABI.json"; 

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
    const [className, setClassName] = useState('');
    const [lectureTime, setLectureTime] = useState('');
    const [lectures, setLectures] = useState([]);
    const [studentsForLecture, setStudentsForLecture] = useState([]);

    const [providerAddress, setProviderAddress] = useState("");
    const contractAddress = "0xbBa14ADcBaB600F866428C4Dd8BF4d6003f8BA08";

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

    const authorizeProvider = async () => {
        if (isOwner){
            try {
                const tx = await contract.authorizeProvider(providerAddress);
                await tx.wait();
                alert(`Provider ${providerAddress} authorized successfully`);

            } catch(error) {
                console.error("Only contract owner can authorize different providers");
            }
        } else {
            alert("Only contract owner can call this function");
        }
    }

    const addLecture = async () => {
        try {
            const tx = await contract.addLecture(
                ethers.BigNumber.from(lectureID),
                className,
                lectureTime
            );
            await tx.wait();
            alert('Lecture added successfully.');
        } catch (error) {
            console.error('Error adding lecture: ', error);
        }
    };

    const addStudentToLecture = async () => {
        try {
            const studentAddress = ethers.utils.getAddress(studentID); // Converts to address format
            const tx = await contract.addRecord(
                studentAddress,  
                studentName,
                ethers.BigNumber.from(lectureID)
            );
            await tx.wait();
            alert('Student added to lecture successfully.');
        } catch (error) {
            console.error('Error adding student to lecture: ', error);
        }
    };

    const fetchAllLectures = async () => {
        try {
            const allLectures = await contract.getAllLectures();
    
            console.log("Raw Lectures Data:", allLectures);
    
            const formattedLectures = allLectures[0].map((_, index) => ({
                lectureID: allLectures[0][index].toNumber(), 
                className: allLectures[1][index],       
                lectureTime: allLectures[2][index]          
            }));
    
            setLectures(formattedLectures);
            console.log("Formatted Lectures:", formattedLectures);
        } catch (error) {
            console.error("Error fetching lectures:", error);
        }
    };

    const getStudentsForLecture = async () => {
        try {
            const lectureIDBN = ethers.BigNumber.from(lectureID); 
            const students = await contract.getStudentsByLecture(lectureIDBN);
            console.log(students); 
            const formattedStudents = students.map(student => ({
                recordID: student.recordID.toNumber(),
                studentName: student.studentName,
                lectureID: student.lectureID.toNumber(),
                timestamp: new Date(student.timestamp.toNumber() * 1000).toLocaleString(),
            }));
            setStudentsForLecture(formattedStudents);  // Update the UI
        } catch (error) {
            console.error('Error fetching students for lecture: ', error);
        }
    };

    return (
        <div className='container'>
            <h1 className="title">Learning Management System</h1>
            {account && <p className='account-info'>Connected Account: {account}</p>}
            {isOwner && <p className='owner-info'>You are the contract owner</p>}

            <div className="form-section">
                <h2>Lecturer Authorization</h2>
                <input className='input-field' type= "text" placeholder='Provider Address' value = {providerAddress} onChange={(e) => setProviderAddress(e.target.value)}/>
                <button className='action-button' onClick={authorizeProvider}>Authorize Provider</button>
            </div>

            <div className="form-section">
                <h2>Add Lecture</h2>
                <input
                    className='input-field'
                    type="text"
                    placeholder="Lecture ID"
                    value={lectureID}
                    onChange={e => setLectureID(e.target.value)}
                />
                <input
                    className='input-field'
                    type="text"
                    placeholder="Class Name"
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                />
                <input
                    className='input-field'
                    type="text"
                    placeholder="Lecture Time"
                    value={lectureTime}
                    onChange={e => setLectureTime(e.target.value)}
                />
                <button className='action-button' onClick={addLecture}>Add Lecture</button>
            </div>

            <div className="form-section">
                <h2>Add Student to Lecture</h2>
                <input
                    className='input-field'
                    type="text"
                    placeholder="Student ID"
                    value={studentID}
                    onChange={e => setStudentID(e.target.value)}
                />
                <input
                    className='input-field'
                    type="text"
                    placeholder="Student Name"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                />
                <input
                    className='input-field'
                    type="text"
                    placeholder="Lecture ID"
                    value={lectureID}
                    onChange={e => setLectureID(e.target.value)}
                />
                <button className='action-button' onClick={addStudentToLecture}>Add Student</button>
            </div>

            <div className="form-section">
                <h2>List All Lectures</h2>
                <button className='action-button' onClick={fetchAllLectures}>Fetch Lectures</button>
                <ul>
                    {lectures.length > 0 ? (
                        lectures.map(lecture => (
                            <li key={lecture.lectureID}>
                                {lecture.className || 'Unnamed Class'} - {lecture.lectureTime || 'Unknown Time'}
                            </li>
                        ))
                    ) : (
                        <li>No lectures available</li>
                    )}
                </ul>
            </div>

            <div className="form-section">
                <h2>List Students for a Lecture</h2>
                <input
                    className='input-field'
                    type="text"
                    placeholder="Lecture ID"
                    value={lectureID}
                    onChange={e => setLectureID(e.target.value)}
                />
                <button className='action-button' onClick={getStudentsForLecture}>Fetch Students</button>
                <ul>
                    {studentsForLecture.map(student => (
                        <li key={student.recordID}>{student.studentName}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LMS;
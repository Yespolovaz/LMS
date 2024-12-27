// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentsRecords {
    address owner;

    struct Record {
        uint256 recordID;
        string studentName;
        uint256 lectureID;
        uint256 timestamp;
    }

    struct Lecture {
        uint256 lectureID;
        string className;
        string lectureTime;
    }

    mapping(uint256 => Lecture) public lectures; // Stores lectures by ID
    uint256 public lectureCount;

    mapping(address => Record[]) private studentRecords; // Stores student records by MetaMask address
    mapping(address => bool) private authorizedProviders; // Tracks authorized providers
    mapping(uint256 => address[]) private lectureStudents; // Maps lecture ID to list of student addresses
    mapping(address => uint256[]) private studentSchedules; // Stores student schedules by address

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this function");
        _;
    }

    modifier onlyAuthorizedProvider() {
        require(authorizedProviders[msg.sender], "Not an authorized provider");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function authorizeProvider(address provider) public onlyOwner {
        authorizedProviders[provider] = true;
    }

    function addRecord(
        address studentAddress,
        string memory studentName,
        uint256 lectureID
    ) public onlyAuthorizedProvider {
        // Ensure lecture exists
        require(bytes(lectures[lectureID].className).length > 0, "Lecture does not exist");

        // Check if the student is already associated with the lecture
        bool alreadyAdded = false;
        for (uint256 i = 0; i < lectureStudents[lectureID].length; i++) {
            if (lectureStudents[lectureID][i] == studentAddress) {
                alreadyAdded = true;
                break;
            }
        }

        // Add student to the lecture if not already associated
        if (!alreadyAdded) {
            lectureStudents[lectureID].push(studentAddress);
        }

        // Add a record for the student
        uint256 recordID = studentRecords[studentAddress].length + 1;
        studentRecords[studentAddress].push(Record(recordID, studentName, lectureID, block.timestamp));

        // Add lecture to student's schedule
        studentSchedules[studentAddress].push(lectureID);
    }

    function getStudentRecords(address studentAddress) public view onlyAuthorizedProvider returns (Record[] memory) {
        return studentRecords[studentAddress];
    }

    function addLecture(
        uint256 lectureID,
        string memory className,
        string memory lectureTime
    ) public onlyOwner {
        require(bytes(lectures[lectureID].className).length == 0, "LectureID already exists");
        lectures[lectureID] = Lecture(lectureID, className, lectureTime);
        lectureCount++;
    }

    function getLecture(uint256 lectureID) public view returns (Lecture memory) {
        return lectures[lectureID];
    }

    function getAllLectures() public view returns (uint256[] memory, string[] memory, string[] memory) {
        uint256[] memory ids = new uint256[](lectureCount);
        string[] memory classNames = new string[](lectureCount);
        string[] memory lectureTimes = new string[](lectureCount);

        uint256 index = 0;
        for (uint256 i = 1; i <= lectureCount; i++) {
            if (bytes(lectures[i].className).length > 0) {
                ids[index] = lectures[i].lectureID;
                classNames[index] = lectures[i].className;
                lectureTimes[index] = lectures[i].lectureTime;
                index++;
            }
        }

        return (ids, classNames, lectureTimes);
    }

    function getStudentsByLecture(uint256 lectureID) public view onlyAuthorizedProvider returns (Record[] memory) {
        address[] memory studentAddresses = lectureStudents[lectureID];
        uint256 totalStudents = studentAddresses.length;
        Record[] memory students = new Record[](totalStudents);

        for (uint256 i = 0; i < totalStudents; i++) {
            Record[] memory records = studentRecords[studentAddresses[i]];
            for (uint256 j = 0; j < records.length; j++) {
                if (records[j].lectureID == lectureID) {
                    students[i] = records[j];
                    break;
                }
            }
        }
        return students;
    }

    function getStudentSchedule(address student) public view returns (Lecture[] memory) {
        uint256[] storage schedule = studentSchedules[student];
        Lecture[] memory result = new Lecture[](schedule.length);

        for (uint256 i = 0; i < schedule.length; i++) {
            result[i] = lectures[schedule[i]];
        }

        return result;
    }
}

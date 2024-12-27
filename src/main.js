import { useNavigate } from "react-router-dom";

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div className="main-page">
            <h1 className="title">Welcome to the Learning Management System</h1>
            <div className="role-selection">
                <button className="role-button" onClick={() => navigate("/student")}>
                    I'm a Student
                </button>
                <button className="role-button" onClick={() => navigate("/lecturer")}>
                    I'm a Lecturer
                </button>
            </div>
        </div>
    );
};

export default MainPage;

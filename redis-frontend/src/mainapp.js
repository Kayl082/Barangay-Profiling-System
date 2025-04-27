import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import "./mainapp.css";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import adminProfile from './images/admin_profile.webp';
import iliganLogo from './images/iligan_logo.png';
import tambcanLogo from './images/tambcan_logo.png';
//Import your components
import Dashboard from "./components/Dashboard";
import Residents from "./components/Residents";
import Households from "./components/Households";
import SocioEconomic from "./components/SocioEconomic";
import DataVisualization from "./components/DataVisualization";
import Documents from "./components/Documents";

function Mainapp() {
    const storedComponent = localStorage.getItem("activeComponent") || "residents";
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeComponent, setActiveComponent] = useState(storedComponent);
    const navigate = useNavigate(); 

    useEffect(() => {
        localStorage.setItem("activeComponent", activeComponent);
    }, [activeComponent]);

    const [islogoutModalOpen, setislogoutModalOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("userToken"); // Clear any user session data (if applicable)
        localStorage.removeItem("activeComponent"); // Clear stored active component
        navigate("/"); // Redirect back to home (signin page)
    };

    // Map components to state values
    {/*dashboard: <Dashboard setActiveComponent={setActiveComponent}/>,*/}
    const componentsMap = {
        residents: <Residents setActiveComponent={setActiveComponent}/>,
        households: <Households />,
        documents: <Documents />,
        socioeconomic: <SocioEconomic />,
        datavisual: <DataVisualization setActiveComponent={setActiveComponent} />
    };

    return (
        <div className="mainappcontainer">
            {/* Sidebar */}
            <div className={`mainappsidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
                <i 
                    className="bi bi-list toggle-icon"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                ></i>

                {!isSidebarCollapsed && (
                    <>
                        <img src={adminProfile} alt="Admin Profile" id="adminProfile" />
                        <p id="mainappadmin">Admin</p>
                    </>
                )}

                <div className="mainappoptions">
                    {/*<div className={`option ${activeComponent === "dashboard" ? "active-option" : ""}`} onClick={() => setActiveComponent("dashboard")}>
                        <i className="bi bi-house"></i> {!isSidebarCollapsed && "Dashboard"}
                    </div>*/}
                    <div className={`option ${activeComponent === "residents" ? "active-option" : ""}`} onClick={() => setActiveComponent("residents")}>
                        <i className="bi bi-person-bounding-box"></i> {!isSidebarCollapsed && "Residents"}
                    </div>
                    <div className={`option ${activeComponent === "households" ? "active-option" : ""}`} onClick={() => setActiveComponent("households")}>
                        <i className="bi bi-houses"></i> {!isSidebarCollapsed && "Households"}
                    </div>
                    {/* <div className={`option ${activeComponent === "documents" ? "active-option" : ""}`} onClick={() => setActiveComponent("documents")}>
                        <i class="bi bi-file-earmark"></i> {!isSidebarCollapsed && "Documents"}
                    </div> */}
                    <div className={`option ${activeComponent === "socioeconomic" ? "active-option" : ""}`} onClick={() => setActiveComponent("socioeconomic")}>
                        <i className="bi bi-duffle"></i> {!isSidebarCollapsed && "Socio-Economic"}
                    </div>
                    <div className={`option ${activeComponent === "datavisual" ? "active-option" : ""}`} onClick={() => setActiveComponent("datavisual")}>
                        <i className="bi bi-bar-chart"></i> {!isSidebarCollapsed && "Data Visualization"}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="logout-btn" onClick={() => setislogoutModalOpen(true)}>
                    <i className="bi bi-box-arrow-right"></i> {!isSidebarCollapsed && "Logout"}
                </div>
            </div>

            {/* Right Side */}
            <div className="mainapprightside">
                <div className="mainapptop">
                    <img src={tambcanLogo} alt="Tambacan Logo" id="tambacanlogo" />
                    <div id="signintitle">Tambacan Profiling System</div>
                    <img src={iliganLogo} alt="Iligan City Logo" id="iliganlogo"/>
                </div>

                <div className="mainappmainpart">
                    {componentsMap[activeComponent]}
                </div>
            </div>
            
            
            {/**Modal for logout */}
            {islogoutModalOpen && (
                <>
                <div className="modal-backdrop fade show"></div>
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" onClick={() => setislogoutModalOpen(false)} className="btn-close" aria-label="Close"
                                ></button>
                            </div>
                            <div className="modal-body">
                                <h5 className="modal-title">Are you sure you want to logout?</h5>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary"  onClick={() => setislogoutModalOpen(false)}>Close</button>
                                <button type="button"onClick={handleLogout} className="btn btn-primary">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
                </>
            )}

        </div>
    );
}

export default Mainapp;

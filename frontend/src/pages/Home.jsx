/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Home.css"
import TaskBar from "../components/TaskBar";



function Home() {
    const subjectCodes = [
        "AAS", "AEM", "AEP", "AIIS", "AIRS", "ALS", "AMST", "ANSC", "ANTHR", 
        "ARAB", "ARCH", "ARKEO", "ART", "ARTH", "AS", "ASIAN", "ASL", "ASRC", 
        "ASTRO", "BCS", "BEE", "BENGL", "BIOAP", "BIOCB", "BIOEE", "BIOGB", 
        "BIOMG", "BIOMI", "BIOMS", "BIONB", "BME", "BSOC", "BTRY", "BURM", 
        "CAPS", "CEE", "CHEM", "CHENG", "CHERO", "CHIN", "CHLIT", "CLASS", 
        "COGST", "COLLS", "COML", "COMM", "CRP", "CS", "CZECH", "DEA", 
        "DESIGN", "DUTCH", "EAS", "ECE", "ECON", "EDUC", "ELSO", "ENGL", 
        "ENGRC", "ENGRD", "ENGRG", "ENGRI", "ENMGT", "ENTOM", "ENVS", "FDSC", 
        "FGSS", "FINN", "FREN", "FSAD", "GDEV", "GERST", "GOVT", "GRAD", 
        "GREEK", "HADM", "HD", "HE", "HEBRW", "HIERO", "HINDI", "HIST", 
        "HUNGR", "ILRGL", "ILRHR", "ILRID", "ILRLE", "ILROB", "ILRST", "IM", 
        "INDO", "INFO", "ITAL", "JAPAN", "JPLIT", "JWST", "KANAD", "KHMER", 
        "KOREA", "LA", "LATA", "LATIN", "LAW", "LEAD", "LEGAL", "LGBT", 
        "LING", "LSP", "MAE", "MATH", "MEDVL", "MGMT", "MILS", "MSE", "MUSIC", 
        "NACC", "NAVS", "NBA", "NBAY", "NCC", "NEPAL", "NES", "NMI", "NRE", 
        "NS", "NTRES", "ORIE", "PE", "PERSN", "PHIL", "PHYS", "PLSCI", "PMA", 
        "POLSH", "PORT", "PSYCH", "PUBPOL", "PUNJB", "QUECH", "REAL", "RELST", 
        "ROMS", "RUSSA", "RUSSL", "SANSK", "SHUM", "SINHA", "SNLIT", "SOC", 
        "SPAN", "STS", "STSCI", "SWAHL", "SWED", "SYSEN", "TAG", "TAMIL", 
        "TECH", "TECHIE", "THAI", "TIBET", "TOX", "TURK", "UKRAN", "UNILWYL", 
        "URDU", "VETCS", "VETMI", "VIEN", "VIET", "VISST", "VTBMS", "VTMED", 
        "VTPEH", "VTPMD", "WOLOF", "WRIT", "YORUB", "ZULU"
      ];
      
      const distributionCodes = ['ALC-AAP', 'ALC-AS', 'ALC-HA', 'BIO-AG', 'BIO-AS', 
        'BIOLS-AG', 'BIONLS-AG', 'CA-AAP', 'CA-AG', 'CA-AS', 'CA-HE', 'CE-EN', 
        'CHPH-AG', 'D-AG', 'D-HE', 'ETM-AAP', 'ETM-AS', 'ETM-HA', 'FL-AAP', 'FL-AG',
         'GB', 'GHB', 'GLC-AAP', 'GLC-AS', 'GLC-HA', 'HA-AAP', 'HA-AG', 'HA-AS', 
         'HA-HE', 'HB', 'HST-AAP', 'HST-AS', 'HST-HA', 'KCM-AAP', 'KCM-AG', "KCM-AS", 
         "KCM-HE", "LA-AAP", "LA-AG", "LA-AS", "LAD-HE", "MQL-AG", "MQR-AAP", "MQR-AS", 
         "MQR-HE", "OPHLS-AG", "ORL-AG", "PBS-AAP", "PBS-AS", "PBS-HE", "PBSS-AS", 
         "PHS-AAP", "PHS-AS", "SBA-AAP", "SBA-AG", "SBA-AS", "SBA-HE", "SCD-AAP", 
         "SCD-AS", "SCD-HA", "SDS-AAP", "SDS-AS", "SDS-HA", "SMR-AAP", "SMR-AS", 
         "SMR-HA", "SSC-AAP", "SSC-AS", "SSC-HA", "WRT-AG"];

    const navigate = useNavigate();
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false);


    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [filteredSubjectCodes, setFilteredSubjectCodes] = useState(subjectCodes);
    const [filteredDistributions, setDistributions] = useState(distributionCodes);

    const [minCreditHours, setMinCreditHours] = useState(0);
    const [maxCreditHours, setMaxCreditHours] = useState(10);
    const [minCourseNumber, setMinCourseNumber] = useState(0);
    const [maxCourseNumber, setMaxCourseNumber] = useState(10000);


    const toggleDropdown = () => setIsFilterOpen(!isFilterOpen);

    const toggleAllSubjectCodes = () => {
        setFilteredSubjectCodes(
          filteredSubjectCodes.length === subjectCodes.length 
            ? [] 
            : [...subjectCodes]
        );
      };

    const toggleSubjectCode = (subject) => {
        setFilteredSubjectCodes(prev =>
            prev.includes(subject) ? prev.filter(s => s !== subject) : [prev, subject]
        )
    }

      const toggleAllDistributions = () => {
        setDistributions(
          filteredDistributions.length === distributionCodes.length 
            ? [] 
            : [...distributionCodes]
        );
      };

      const toggleDistribution = (distribution) => {
        setDistributions(prev => 
            prev.includes(distribution) ? prev.filter(s => s !== distribution) : [prev, distribution]
        )
      }




    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            //TODO: figure out what the url is
            const response = await api.post("chat/", {query})
            if (response.data) {
                // Navigate to results page with the processed data
                navigate("/results", {
                    state: {
                        result: response.data,
                        query: query
                    }
                });
            } else {
                throw new Error('No data received from server');
            }
        } catch(error) {
            alert(error);
            handleLogout;
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            const accessToken = localStorage.getItem('ACCESS_TOKEN');
            const refreshToken = localStorage.getItem('REFRESH_TOKEN');
            await api.post('/api/logout/', { access_token: accessToken, refresh_token: refreshToken });
            localStorage.removeItem('ACCESS_TOKEN');
            localStorage.removeItem('REFRESH_TOKEN');
            navigate("/login")
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div>

            <TaskBar/>


            <div>
                <h1 className="greeting">What do 
                <br />
                you want to learn?
                </h1>               
            </div>


            <form onSubmit={handleSubmit}>
                <div className="searchBar">
                    <div className="query-bar">
                        <input 
                            type='search' 
                            id='query' 
                            name='query' 
                            required 
                            onChange={(e) => setQuery(e.target.value)} 
                            value={query} 
                            className="query-input"
                            placeholder="Ask CourseFind"
                        ></input>
            
                        <button className="query-button" type="submit">Submit</button>

                        <button type='button' onClick={toggleDropdown} className="filterDropdownButton">
                            {/* <svg className="filter-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path className="filterSymbol" d="M3 7H21M7 12H17M11 17H13" stroke="#6A6A6A"/>
                            </svg> */}
                            <span className="filter-label">Advanced Search</span>
                        </button>



                    </div>
                    
                </div>
                
            </form>




            




            {/* {isFilterOpen && (
                <div className="dropdownMenu">

                

                    <label className="creditHour">Credit Hours</label>



                </div>
            )} */}





        </div>
    )
}

export default Home
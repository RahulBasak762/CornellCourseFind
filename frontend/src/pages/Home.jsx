 
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react";  // Added useRef
import api from "../api";
import "../styles/Home.css"
import TaskBar from "../components/TaskBar";

function Home() {
    const subjectCodes = [ "AAS", "AEM", "AEP", "AIIS", "AIRS", "ALS", "AMST", "ANSC", 
        "ANTHR", "ARAB", "ARCH", "ARKEO", "ART", "ARTH", "AS", "ASIAN", "ASL", "ASRC", 
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

    const liberalArtDistribution = ['ALC-AAP', 'ALC-AS', 'ALC-HA', 'CA-AAP', 
        'CA-AG', 'CA-AS', 'CA-HE', "LA-AAP", "LA-AG", "LA-AS", "LAD-HE", "SCD-HA", 
        'HST-AAP', 'HST-AS', 'HST-HA', 'HA-AAP', 'HA-AG', 'HA-AS', 'HA-HE', 'KCM-AAP', 
        'KCM-AG', "KCM-AS", "KCM-HE", 'ETM-AAP', 'ETM-AS', 'ETM-HA', "SBA-AAP", "SBA-AG", 
        "SBA-AS", "SBA-HE", "SSC-AAP", "SSC-AS", "SSC-HA", 'GLC-AAP', 'GLC-AS', 'GLC-HA', 
        'GLC-AAP', 'GLC-AS', 'GLC-HA', 'FL-AAP', 'FL-AG', 'CE-EN', 'SCD-AS', 'D-AG'];

    const navigate = useNavigate();
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef(null);  // Added abort controller ref

    // Added cleanup effect
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filteredSubjectCodes, setFilteredSubjectCodes] = useState(subjectCodes);
    const [filteredDistributions, setDistributions] = useState([]);
    const [minCreditHours, setMinCreditHours] = useState(0);
    const [maxCreditHours, setMaxCreditHours] = useState(15);
    const [minCourseNumber, setMinCourseNumber] = useState(0);
    const [maxCourseNumber, setMaxCourseNumber] = useState(10000);
    const [requireFWS, setRequireFWS] = useState(false)

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
            prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
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
            prev.includes(distribution) ? prev.filter(s => s !== distribution) : [...prev, distribution]
        )
    }

    const setLAD = () => {
        setDistributions(liberalArtDistribution);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        // Abort any existing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        try {
            const response = await api.post("http://localhost:8000/chat/", 
                {
                    query, 
                    minCourseNumber, 
                    maxCourseNumber, 
                    filteredSubjectCodes, 
                    filteredDistributions, 
                    minCreditHours, 
                    maxCreditHours, 
                    requireFWS
                },
                {
                    signal: abortControllerRef.current.signal
                }
            );

            if (response.data) {
                navigate("/results", {
                    state: {
                        result: response.data,
                        query: query,
                        minCourseNumber: minCourseNumber,
                        maxCourseNumber: maxCourseNumber,
                        subjectCodes: filteredSubjectCodes,
                        distributions: filteredDistributions,
                        maxCredits: maxCreditHours,
                        requireFWS: requireFWS
                    }
                });
            } else {
                throw new Error('No data received from server');
            } 
        } catch(error) {
            if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
                alert(error);
                handleLogout();
            }
        } finally {
            if (abortControllerRef.current) {
                setLoading(false);
            }
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
                            disabled={loading}
                        />
            
                        <button 
                            className="query-button" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Submit'}
                        </button>

                        {isFilterOpen || 
                            <button type='button' onClick={toggleDropdown} className="closedFilterDropdownButton">
                            <span className="filter-label">Open Filters</span>
                            </button>
                        }

                        {isFilterOpen &&
                            <div className="buttonContainers">
                                <div className="dropdownMenu">
                                    <div className="headerContainer">
                                        <div className='subjectCode'>
                                            Subject Area
                                            <br/>

                                            <div  className="subjectCodeSelectDeselectAllText" onClick={toggleAllSubjectCodes}>
                                                <input 
                                                    type="checkbox"
                                                    checked={filteredSubjectCodes.length === subjectCodes.length}
                                                    onChange={() => {toggleAllSubjectCodes}}
                                                />

                                                <span>
                                                    {filteredSubjectCodes.length === subjectCodes.length
                                                        ? 'Deselect All' 
                                                        : 'Select All'}
                                                </span>
                                            </div>

                                            <div className="isFWS" onClick={() => {setRequireFWS(!requireFWS)}}>
                                                <input 
                                                    type="checkbox"
                                                    checked={requireFWS}
                                                    onChange={() => {}}
                                                />

                                                <span>
                                                    FWS Required
                                                </span>
                                            </div>

                                            <div className="subjectCodeCheckboxes">
                                                {subjectCodes.map(subjectCode => (
                                                <div 
                                                    key={subjectCode}
                                                    onClick={() => toggleSubjectCode(subjectCode)}
                                                >
                                                    <input 
                                                    type="checkbox"
                                                    checked={filteredSubjectCodes.includes(subjectCode)}
                                                    onChange={() => {}}
                                                    />
                                                    <span>{subjectCode}</span>
                                                </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className='subjectNumbers'>
                                            Course Number
                                            <br/>
                                            <label className='MinMaxLabels'>Minimum: </label>
                                            <br/>
                                            <input 
                                            type="number" 
                                            placeholder="Min"
                                            value={minCourseNumber}
                                            onChange={(e) => setMinCourseNumber(e.target.value)}
                                            className="MinMaxInputs"
                                            step='1000'
                                            min='0'
                                            max={maxCourseNumber}
                                            />

                                            <label className='MinMaxLabels'>Maximum: </label>
                                            <br/>
                                            <input 
                                            type="number" 
                                            placeholder="Max"
                                            value={maxCourseNumber}
                                            onChange={(e) => setMaxCourseNumber(e.target.value)}
                                            className="MinMaxInputs"
                                            step='step=1000'
                                            min={minCourseNumber}
                                            max='10000'
                                            />

                                        </div>

                                        <div className='credits'>
                                            Credits
                                            <br/>
                                            <label className='MinMaxLabels'>Minimum: </label>
                                            <br/>
                                            <input 
                                            type="number" 
                                            placeholder="Min"
                                            value={minCreditHours}
                                            onChange={(e) => setMinCreditHours(e.target.value)}
                                            className="MinMaxInputs"
                                            step='1'
                                            min='0'
                                            max={maxCreditHours}
                                            />

                                            <label className='MinMaxLabels'>Maximum: </label>
                                            <br/>
                                            <input 
                                            type="number" 
                                            placeholder="Max"
                                            value={maxCreditHours}
                                            onChange={(e) => setMaxCreditHours(e.target.value)}
                                            className="MinMaxInputs"
                                            step='1'
                                            min={minCreditHours}
                                            max='15'
                                            />
                                        </div>

                                        <div className='distributions'>
                                            Distributions
                                            <br/>

                                            <div className="distributionSelectDeselectAllText" onClick={toggleAllDistributions}>
                                                <input 
                                                    type="checkbox"
                                                    checked={filteredDistributions.length === distributionCodes.length}
                                                    onChange={() => {}}
                                                />

                                                <span>
                                                    {filteredDistributions.length === distributionCodes.length
                                                        ? 'Deselect All' 
                                                        : 'Select All'}
                                                </span>
                                            </div>

                                            <div className='isLAD' onClick={setLAD}>
                                                <input 
                                                    type="checkbox"
                                                    checked={filteredDistributions.every(value => liberalArtDistribution.includes(value)) && filteredDistributions.length === liberalArtDistribution.length}
                                                    onChange={() => {}}
                                                />

                                                <span>
                                                    Liberal Art Distributions
                                                </span>
                                            </div>

                                            <div className="distributionCheckboxes">
                                                {distributionCodes.map(distributionCode => (
                                                <div 
                                                    key={distributionCode}
                                                    onClick={() => toggleDistribution(distributionCode)}
                                                >
                                                    <input 
                                                    type="checkbox"
                                                    checked={filteredDistributions.includes(distributionCode)}
                                                    onChange={() => {}}
                                                    />
                                                    <span>{distributionCode}</span>
                                                </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button type='button' onClick={toggleDropdown} className="openFilterDropdownButton">Close Filters</button>
                            </div>
                        }
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Home
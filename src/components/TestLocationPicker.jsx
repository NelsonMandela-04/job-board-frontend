import { useState } from "react";
import JobLocationPicker from "./JobLocationPicker";


function TestLocationPicker() {

    const [location, setLocation] = useState({
        address: "",
        latitude: null,
        longitude: null,
    });


    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "40px auto",
                padding: "20px",
            }}
        >

            <h1>
                Test Job Location Picker
            </h1>

            <JobLocationPicker
                value={location}
                onChange={(newLocation) => {
                    console.log(
                        "Selected location:",
                        newLocation
                    );

                    setLocation(newLocation);
                }}
            />


            <div
                style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "#f3f4f6",
                    borderRadius: "8px",
                }}
            >

                <h3>
                    Location Data
                </h3>

                <pre>
                    {JSON.stringify(
                        location,
                        null,
                        2
                    )}
                </pre>

            </div>

        </div>
    );
}


export default TestLocationPicker;
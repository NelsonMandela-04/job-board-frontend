import { useEffect, useRef, useState } from "react";

import {
    APIProvider,
    Map,
    AdvancedMarker,
    useMap,
    useMapsLibrary,
} from "@vis.gl/react-google-maps";

import "./JobLocationPicker.css";


const DEFAULT_CENTER = {
    lat: 6.5244,
    lng: 3.3792,
};


function LocationPicker({ value, onChange }) {
    const map = useMap();
    const places = useMapsLibrary("places");

    const autocompleteContainerRef = useRef(null);
    const autocompleteRef = useRef(null);
    const onChangeRef = useRef(onChange);

    const [selectedLocation, setSelectedLocation] = useState(() => {
        if (
            value?.latitude !== undefined &&
            value?.latitude !== null &&
            value?.longitude !== undefined &&
            value?.longitude !== null
        ) {
            return {
                lat: Number(value.latitude),
                lng: Number(value.longitude),
            };
        }

        return null;
    });

    const [address, setAddress] = useState(
        value?.address || ""
    );

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);


    useEffect(() => {
        if (
            !places ||
            !autocompleteContainerRef.current
        ) {
            return;
        }

        setLoading(false);

        if (autocompleteRef.current) {
            return;
        }

        const autocomplete =
            new places.PlaceAutocompleteElement();

        autocomplete.placeholder =
            "Search for a job location...";

        autocomplete.includedRegionCodes = ["ng"];

        autocompleteContainerRef.current.appendChild(
            autocomplete
        );

        autocompleteRef.current = autocomplete;


        const handlePlaceSelect = async (event) => {
            try {
                setError("");

                const placePrediction =
                    event.placePrediction;

                if (!placePrediction) {
                    setError(
                        "Please select a location from the Google suggestions."
                    );
                    return;
                }

                const place =
                    placePrediction.toPlace();

                await place.fetchFields({
                    fields: [
                        "displayName",
                        "formattedAddress",
                        "location",
                    ],
                });

                if (!place.location) {
                    setError(
                        "Google could not determine the coordinates for this location."
                    );
                    return;
                }

                const latitude =
                    place.location.lat();

                const longitude =
                    place.location.lng();

                const formattedAddress =
                    place.formattedAddress ||
                    place.displayName ||
                    "";

                const newLocation = {
                    lat: latitude,
                    lng: longitude,
                };

                setSelectedLocation(
                    newLocation
                );

                setAddress(
                    formattedAddress
                );


                if (onChangeRef.current) {
                    onChangeRef.current({
                        address: formattedAddress,
                        latitude,
                        longitude,
                    });
                }


                if (map) {
                    map.panTo(newLocation);
                    map.setZoom(15);
                }

            } catch (err) {
                console.error(
                    "Google Maps place selection error:",
                    err
                );

                setError(
                    "Unable to load the selected location. Please try again."
                );
            }
        };


        autocomplete.addEventListener(
            "gmp-select",
            handlePlaceSelect
        );


        return () => {
            autocomplete.removeEventListener(
                "gmp-select",
                handlePlaceSelect
            );

            if (
                autocompleteContainerRef.current &&
                autocomplete.parentNode ===
                    autocompleteContainerRef.current
            ) {
                autocompleteContainerRef.current.removeChild(
                    autocomplete
                );
            }

            autocompleteRef.current = null;
        };

    }, [places, map]);


    useEffect(() => {
        if (!map || !selectedLocation) {
            return;
        }

        map.panTo(selectedLocation);
        map.setZoom(15);

    }, [map, selectedLocation]);


    const center =
        selectedLocation || DEFAULT_CENTER;


    return (
        <div className="job-location-picker">

            <div className="location-search-section">

                <label className="location-label">
                    Job Location
                    <span className="required">
                        *
                    </span>
                </label>


                <div
                    ref={autocompleteContainerRef}
                    className="google-autocomplete-container"
                />


                {loading && (
                    <div className="location-loading">
                        Loading Google location search...
                    </div>
                )}


                {error && (
                    <div className="location-error">
                        {error}
                    </div>
                )}

            </div>


            {address && (
                <div className="selected-location">

                    <div className="selected-location-title">
                        Selected Location
                    </div>

                    <div className="selected-location-address">
                        {address}
                    </div>


                    {selectedLocation && (
                        <div className="coordinates">

                            <span>
                                Latitude:{" "}
                                {selectedLocation.lat.toFixed(6)}
                            </span>

                            <span>
                                Longitude:{" "}
                                {selectedLocation.lng.toFixed(6)}
                            </span>

                        </div>
                    )}

                </div>
            )}


            <div className="job-map-container">

                <Map
                    defaultCenter={center}
                    defaultZoom={
                        selectedLocation
                            ? 15
                            : 10
                    }
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                    mapId="DEMO_MAP_ID"
                >

                    {selectedLocation && (
                        <AdvancedMarker
                            position={
                                selectedLocation
                            }
                            title={address}
                        />
                    )}

                </Map>

            </div>


            {!selectedLocation && (
                <div className="location-help">
                    Search for the job location above
                    and select a location from
                    Google's suggestions.
                </div>
            )}

        </div>
    );
}


function JobLocationPicker({
    value,
    onChange,
}) {
    const apiKey =
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


    if (!apiKey) {
        return (
            <div className="location-error">
                Google Maps API key is missing.
                Please check your frontend .env file.
            </div>
        );
    }


    return (
        <APIProvider
            apiKey={apiKey}
            libraries={[
                "places",
                "marker",
            ]}
            region="NG"
        >

            <LocationPicker
                value={value}
                onChange={onChange}
            />

        </APIProvider>
    );
}


export default JobLocationPicker;
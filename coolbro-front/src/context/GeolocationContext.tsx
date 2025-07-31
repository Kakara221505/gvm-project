import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Coordinates = {
    latitude: number;
    longitude: number;
};

const GeolocationContext = createContext<{ coordinates: Coordinates | null; updateCoordinates: (coords: Coordinates) => void }>({
    coordinates: null,
    updateCoordinates: () => { },
});

// const GeolocationContext = createContext<Coordinates | null>(null);

export const GeolocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [hasFetchedGeolocation, setHasFetchedGeolocation] = useState(false);

    const updateCoordinates = (coords: Coordinates) => {
        setCoordinates(coords);
    };

    const fetchGeolocation = async () => {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            const { latitude, longitude } = position.coords;
            setCoordinates({ latitude, longitude });
            setHasFetchedGeolocation(true);
        } catch (error) {
            console.error("Error getting geolocation:", error);
        }
    };

    useEffect(() => {
        if ("geolocation" in navigator && !hasFetchedGeolocation) {
            fetchGeolocation();
        }
    }, [hasFetchedGeolocation]);


    return (
        <>
            <GeolocationContext.Provider value={{ coordinates, updateCoordinates }}>
                {children}
            </GeolocationContext.Provider>
        </>
    );
};

export const useGeolocation = () => {
    const { coordinates } = useContext(GeolocationContext);
    return coordinates;
};

export const useGeolocationUpdater = () => {
    const { updateCoordinates } = useContext(GeolocationContext);
    return updateCoordinates;
};
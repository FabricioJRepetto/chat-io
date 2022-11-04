import { useState } from "react";

export const useAlerts = (initialValue = false) => {
    const [isOpen, setIsOpen] = useState(initialValue);
    const [props, setProps] = useState(false)

    const openAlert = (props) => {
        setIsOpen(true);
        props && setProps(props);
    };

    const closeAlert = () => setIsOpen(false);

    return [isOpen, openAlert, closeAlert, props];
};

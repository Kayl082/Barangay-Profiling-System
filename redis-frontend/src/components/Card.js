const Card = ({ children }) => {
    return (
        <div 
            id="csscard" 
            style={{
                padding: "20px",
                paddingRight: "30px",
                paddingLeft: "30px",
                border: "1px solid #00bf63",
                borderRadius: "10px",
                width: "250px",
                height: "120px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0px 0px 5px 1px #00bf63",
                margin: "20px 0px",

            }}
        >
            {children}
        </div>
    );
};

export default Card;

const MyUserReducer = (currentState, action) => {
    switch(action.type){
        case "login":
            return action.payload;
        case "REMOVE_USER":
            return null;
        default:
            return currentState;
    }
};

export default MyUserReducer;
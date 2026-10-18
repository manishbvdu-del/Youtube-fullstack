// Define a higher-order function called asyncHandler.
// It takes a request handler (controller function) as input.
const asyncHandler = (requestHandler) => {
    // Return a new function that Express can use as middleware.
    // This function receives the usual req, res, next arguments.
    return (req, res, next) => {
        // Wrap the requestHandler in Promise.resolve().
        // This ensures that if requestHandler returns a Promise (async function),
        // we can catch any errors using .catch().
        Promise.resolve(requestHandler(req, res, next))
            .catch((err) => next(err)) // Pass errors to Express error-handling middleware.
    }
}

// Export asyncHandler so it can be imported and used in route files.
export { asyncHandler }


// DIfferent method 2
// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => () => {}

// const asyncHandler = (fn) => async (req,res,next) => {
//     try{
//         await fn(req,res,next)
//          }     catch(error){
//             res.status(err.code || 500).json({
//                 success:false,
//                 message:err.message
//             })
//         }
//     }



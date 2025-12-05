function Flag({ countryCode }) {
     return (
       <img
         src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
         alt={countryCode}
         style={{ width: "24px", height: "18px" }}
       />
     );
   }
   
   export default Flag;
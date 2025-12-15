import React from 'react'
import { useSearchParams } from 'react-router-dom';

function useUrlPosition() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  
  // ✅ Return strings to ensure React detects changes properly
  return [lat, lng];
}

export default useUrlPosition;
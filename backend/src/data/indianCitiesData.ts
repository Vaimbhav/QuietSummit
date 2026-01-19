// Comprehensive Indian Cities Database
// Covers major cities, towns, and popular localities across all states

export const INDIAN_CITIES = [
    // Andhra Pradesh
    { city: 'Visakhapatnam', state: 'Andhra Pradesh', type: 'city' as const, population: 2035922 },
    { city: 'Vijayawada', state: 'Andhra Pradesh', type: 'city' as const, population: 1048240 },
    { city: 'Guntur', state: 'Andhra Pradesh', type: 'city' as const, population: 743354 },
    { city: 'Nellore', state: 'Andhra Pradesh', type: 'city' as const, population: 505258 },
    { city: 'Kurnool', state: 'Andhra Pradesh', type: 'city' as const, population: 484327 },
    { city: 'Rajahmundry', state: 'Andhra Pradesh', type: 'city' as const, population: 341831 },
    { city: 'Tirupati', state: 'Andhra Pradesh', type: 'city' as const, population: 374260 },
    { city: 'Kakinada', state: 'Andhra Pradesh', type: 'city' as const, population: 443028 },

    // Arunachal Pradesh
    { city: 'Itanagar', state: 'Arunachal Pradesh', type: 'city' as const, population: 59490 },
    { city: 'Naharlagun', state: 'Arunachal Pradesh', type: 'town' as const, population: 30086 },
    { city: 'Pasighat', state: 'Arunachal Pradesh', type: 'town' as const, population: 24656 },

    // Assam
    { city: 'Guwahati', state: 'Assam', type: 'city' as const, population: 963429 },
    { city: 'Silchar', state: 'Assam', type: 'city' as const, population: 228951 },
    { city: 'Dibrugarh', state: 'Assam', type: 'city' as const, population: 154019 },
    { city: 'Jorhat', state: 'Assam', type: 'city' as const, population: 195134 },
    { city: 'Nagaon', state: 'Assam', type: 'town' as const, population: 147231 },
    { city: 'Tinsukia', state: 'Assam', type: 'town' as const, population: 125662 },

    // Bihar
    { city: 'Patna', state: 'Bihar', type: 'city' as const, population: 1684222 },
    { city: 'Gaya', state: 'Bihar', type: 'city' as const, population: 474093 },
    { city: 'Bhagalpur', state: 'Bihar', type: 'city' as const, population: 410210 },
    { city: 'Muzaffarpur', state: 'Bihar', type: 'city' as const, population: 393724 },
    { city: 'Darbhanga', state: 'Bihar', type: 'city' as const, population: 306279 },
    { city: 'Purnia', state: 'Bihar', type: 'city' as const, population: 282248 },

    // Chhattisgarh
    { city: 'Raipur', state: 'Chhattisgarh', type: 'city' as const, population: 1010433 },
    { city: 'Bhilai', state: 'Chhattisgarh', type: 'city' as const, population: 625138 },
    { city: 'Bilaspur', state: 'Chhattisgarh', type: 'city' as const, population: 365579 },
    { city: 'Korba', state: 'Chhattisgarh', type: 'city' as const, population: 365198 },

    // Goa
    { city: 'Panaji', state: 'Goa', type: 'city' as const, population: 114759 },
    { city: 'Margao', state: 'Goa', type: 'city' as const, population: 100000 },
    { city: 'Vasco da Gama', state: 'Goa', type: 'town' as const, population: 100000 },
    { city: 'Mapusa', state: 'Goa', type: 'town' as const, population: 40487 },
    { city: 'Ponda', state: 'Goa', type: 'town' as const, population: 25318 },
    { city: 'Calangute', state: 'Goa', type: 'locality' as const, population: 16000 },
    { city: 'Baga', state: 'Goa', type: 'locality' as const, population: 9000 },
    { city: 'Candolim', state: 'Goa', type: 'locality' as const, population: 7000 },
    { city: 'Anjuna', state: 'Goa', type: 'locality' as const, population: 9000 },

    // Gujarat
    { city: 'Ahmedabad', state: 'Gujarat', type: 'city' as const, population: 5577940 },
    { city: 'Surat', state: 'Gujarat', type: 'city' as const, population: 4467797 },
    { city: 'Vadodara', state: 'Gujarat', type: 'city' as const, population: 1670806 },
    { city: 'Rajkot', state: 'Gujarat', type: 'city' as const, population: 1390933 },
    { city: 'Bhavnagar', state: 'Gujarat', type: 'city' as const, population: 605882 },
    { city: 'Jamnagar', state: 'Gujarat', type: 'city' as const, population: 600000 },
    { city: 'Gandhinagar', state: 'Gujarat', type: 'city' as const, population: 195891 },
    { city: 'Junagadh', state: 'Gujarat', type: 'city' as const, population: 320000 },
    { city: 'Anand', state: 'Gujarat', type: 'city' as const, population: 240000 },

    // Haryana
    { city: 'Faridabad', state: 'Haryana', type: 'city' as const, population: 1404653 },
    { city: 'Gurgaon', state: 'Haryana', type: 'city' as const, population: 876969 },
    { city: 'Rohtak', state: 'Haryana', type: 'city' as const, population: 374292 },
    { city: 'Hisar', state: 'Haryana', type: 'city' as const, population: 301249 },
    { city: 'Panipat', state: 'Haryana', type: 'city' as const, population: 294292 },
    { city: 'Karnal', state: 'Haryana', type: 'city' as const, population: 302140 },
    { city: 'Sonipat', state: 'Haryana', type: 'city' as const, population: 250521 },
    { city: 'Ambala', state: 'Haryana', type: 'city' as const, population: 146787 },

    // Himachal Pradesh
    { city: 'Shimla', state: 'Himachal Pradesh', type: 'city' as const, population: 169578 },
    { city: 'Manali', state: 'Himachal Pradesh', type: 'town' as const, population: 8096 },
    { city: 'Dharamshala', state: 'Himachal Pradesh', type: 'town' as const, population: 30764 },
    { city: 'Kullu', state: 'Himachal Pradesh', type: 'town' as const, population: 18306 },
    { city: 'Mandi', state: 'Himachal Pradesh', type: 'town' as const, population: 26422 },
    { city: 'Solan', state: 'Himachal Pradesh', type: 'town' as const, population: 35000 },
    { city: 'Kasauli', state: 'Himachal Pradesh', type: 'town' as const, population: 1952 },

    // Jharkhand
    { city: 'Ranchi', state: 'Jharkhand', type: 'city' as const, population: 1073440 },
    { city: 'Jamshedpur', state: 'Jharkhand', type: 'city' as const, population: 629658 },
    { city: 'Dhanbad', state: 'Jharkhand', type: 'city' as const, population: 1161928 },
    { city: 'Bokaro', state: 'Jharkhand', type: 'city' as const, population: 511000 },

    // Karnataka
    { city: 'Bangalore', state: 'Karnataka', type: 'city' as const, population: 8443675 },
    { city: 'Mysore', state: 'Karnataka', type: 'city' as const, population: 887446 },
    { city: 'Mangalore', state: 'Karnataka', type: 'city' as const, population: 488968 },
    { city: 'Hubli', state: 'Karnataka', type: 'city' as const, population: 943788 },
    { city: 'Belgaum', state: 'Karnataka', type: 'city' as const, population: 610350 },
    { city: 'Gulbarga', state: 'Karnataka', type: 'city' as const, population: 543147 },
    { city: 'Davangere', state: 'Karnataka', type: 'city' as const, population: 435125 },
    { city: 'Bellary', state: 'Karnataka', type: 'city' as const, population: 409644 },
    // Bangalore Localities
    { city: 'Koramangala', state: 'Bangalore, Karnataka', type: 'locality' as const, population: 50000 },
    { city: 'Whitefield', state: 'Bangalore, Karnataka', type: 'locality' as const, population: 40000 },
    { city: 'Indiranagar', state: 'Bangalore, Karnataka', type: 'locality' as const, population: 60000 },
    { city: 'HSR Layout', state: 'Bangalore, Karnataka', type: 'locality' as const, population: 30000 },
    { city: 'Electronic City', state: 'Bangalore, Karnataka', type: 'locality' as const, population: 25000 },
    { city: 'Jayanagar', state: 'Bangalore, Karnataka', type: 'locality' as const, population: 70000 },

    // Kerala
    { city: 'Thiruvananthapuram', state: 'Kerala', type: 'city' as const, population: 957730 },
    { city: 'Kochi', state: 'Kerala', type: 'city' as const, population: 602046 },
    { city: 'Kozhikode', state: 'Kerala', type: 'city' as const, population: 431560 },
    { city: 'Thrissur', state: 'Kerala', type: 'city' as const, population: 315957 },
    { city: 'Kollam', state: 'Kerala', type: 'city' as const, population: 397419 },
    { city: 'Palakkad', state: 'Kerala', type: 'city' as const, population: 131507 },
    { city: 'Alappuzha', state: 'Kerala', type: 'city' as const, population: 177029 },
    { city: 'Kannur', state: 'Kerala', type: 'city' as const, population: 232486 },

    // Madhya Pradesh
    { city: 'Indore', state: 'Madhya Pradesh', type: 'city' as const, population: 1960631 },
    { city: 'Bhopal', state: 'Madhya Pradesh', type: 'city' as const, population: 1798218 },
    { city: 'Jabalpur', state: 'Madhya Pradesh', type: 'city' as const, population: 1055525 },
    { city: 'Gwalior', state: 'Madhya Pradesh', type: 'city' as const, population: 1101981 },
    { city: 'Ujjain', state: 'Madhya Pradesh', type: 'city' as const, population: 515215 },
    { city: 'Sagar', state: 'Madhya Pradesh', type: 'city' as const, population: 273296 },

    // Maharashtra
    { city: 'Mumbai', state: 'Maharashtra', type: 'city' as const, population: 12442373 },
    { city: 'Pune', state: 'Maharashtra', type: 'city' as const, population: 3124458 },
    { city: 'Nagpur', state: 'Maharashtra', type: 'city' as const, population: 2405665 },
    { city: 'Nashik', state: 'Maharashtra', type: 'city' as const, population: 1486053 },
    { city: 'Thane', state: 'Maharashtra', type: 'city' as const, population: 1841488 },
    { city: 'Aurangabad', state: 'Maharashtra', type: 'city' as const, population: 1175116 },
    { city: 'Solapur', state: 'Maharashtra', type: 'city' as const, population: 951558 },
    { city: 'Kolhapur', state: 'Maharashtra', type: 'city' as const, population: 549236 },
    // Mumbai Localities
    { city: 'Bandra', state: 'Mumbai, Maharashtra', type: 'locality' as const, population: 200000 },
    { city: 'Andheri', state: 'Mumbai, Maharashtra', type: 'locality' as const, population: 350000 },
    { city: 'Powai', state: 'Mumbai, Maharashtra', type: 'locality' as const, population: 120000 },
    { city: 'Juhu', state: 'Mumbai, Maharashtra', type: 'locality' as const, population: 100000 },
    { city: 'Borivali', state: 'Mumbai, Maharashtra', type: 'locality' as const, population: 300000 },
    { city: 'Malad', state: 'Mumbai, Maharashtra', type: 'locality' as const, population: 400000 },

    // Manipur
    { city: 'Imphal', state: 'Manipur', type: 'city' as const, population: 268243 },

    // Meghalaya
    { city: 'Shillong', state: 'Meghalaya', type: 'city' as const, population: 143229 },

    // Mizoram
    { city: 'Aizawl', state: 'Mizoram', type: 'city' as const, population: 293416 },

    // Nagaland
    { city: 'Kohima', state: 'Nagaland', type: 'city' as const, population: 99039 },
    { city: 'Dimapur', state: 'Nagaland', type: 'city' as const, population: 122834 },

    // Odisha
    { city: 'Bhubaneswar', state: 'Odisha', type: 'city' as const, population: 837737 },
    { city: 'Cuttack', state: 'Odisha', type: 'city' as const, population: 606007 },
    { city: 'Rourkela', state: 'Odisha', type: 'city' as const, population: 483173 },
    { city: 'Puri', state: 'Odisha', type: 'city' as const, population: 201026 },

    // Punjab
    { city: 'Ludhiana', state: 'Punjab', type: 'city' as const, population: 1618879 },
    { city: 'Amritsar', state: 'Punjab', type: 'city' as const, population: 1132383 },
    { city: 'Jalandhar', state: 'Punjab', type: 'city' as const, population: 873725 },
    { city: 'Patiala', state: 'Punjab', type: 'city' as const, population: 406192 },
    { city: 'Bathinda', state: 'Punjab', type: 'city' as const, population: 285788 },

    // Rajasthan
    { city: 'Jaipur', state: 'Rajasthan', type: 'city' as const, population: 3046163 },
    { city: 'Jodhpur', state: 'Rajasthan', type: 'city' as const, population: 1033756 },
    { city: 'Kota', state: 'Rajasthan', type: 'city' as const, population: 1001694 },
    { city: 'Bikaner', state: 'Rajasthan', type: 'city' as const, population: 644406 },
    { city: 'Udaipur', state: 'Rajasthan', type: 'city' as const, population: 475150 },
    { city: 'Ajmer', state: 'Rajasthan', type: 'city' as const, population: 551360 },
    { city: 'Jaisalmer', state: 'Rajasthan', type: 'city' as const, population: 78300 },
    { city: 'Mount Abu', state: 'Rajasthan', type: 'town' as const, population: 22943 },

    // Sikkim
    { city: 'Gangtok', state: 'Sikkim', type: 'city' as const, population: 100000 },

    // Tamil Nadu
    { city: 'Chennai', state: 'Tamil Nadu', type: 'city' as const, population: 4646732 },
    { city: 'Coimbatore', state: 'Tamil Nadu', type: 'city' as const, population: 1050721 },
    { city: 'Madurai', state: 'Tamil Nadu', type: 'city' as const, population: 1017865 },
    { city: 'Tiruchirappalli', state: 'Tamil Nadu', type: 'city' as const, population: 916857 },
    { city: 'Salem', state: 'Tamil Nadu', type: 'city' as const, population: 826267 },
    { city: 'Tiruppur', state: 'Tamil Nadu', type: 'city' as const, population: 877778 },
    { city: 'Vellore', state: 'Tamil Nadu', type: 'city' as const, population: 483842 },
    { city: 'Erode', state: 'Tamil Nadu', type: 'city' as const, population: 498129 },
    { city: 'Ooty', state: 'Tamil Nadu', type: 'town' as const, population: 88430 },
    { city: 'Kodaikanal', state: 'Tamil Nadu', type: 'town' as const, population: 36501 },

    // Telangana
    { city: 'Hyderabad', state: 'Telangana', type: 'city' as const, population: 6809970 },
    { city: 'Warangal', state: 'Telangana', type: 'city' as const, population: 830281 },
    { city: 'Nizamabad', state: 'Telangana', type: 'city' as const, population: 311152 },
    { city: 'Karimnagar', state: 'Telangana', type: 'city' as const, population: 297447 },
    // Hyderabad Localities
    { city: 'Hitech City', state: 'Hyderabad, Telangana', type: 'locality' as const, population: 50000 },
    { city: 'Gachibowli', state: 'Hyderabad, Telangana', type: 'locality' as const, population: 45000 },
    { city: 'Jubilee Hills', state: 'Hyderabad, Telangana', type: 'locality' as const, population: 80000 },
    { city: 'Banjara Hills', state: 'Hyderabad, Telangana', type: 'locality' as const, population: 70000 },

    // Tripura
    { city: 'Agartala', state: 'Tripura', type: 'city' as const, population: 400004 },

    // Uttar Pradesh
    { city: 'Lucknow', state: 'Uttar Pradesh', type: 'city' as const, population: 2817105 },
    { city: 'Kanpur', state: 'Uttar Pradesh', type: 'city' as const, population: 2767031 },
    { city: 'Ghaziabad', state: 'Uttar Pradesh', type: 'city' as const, population: 1729000 },
    { city: 'Agra', state: 'Uttar Pradesh', type: 'city' as const, population: 1585705 },
    { city: 'Varanasi', state: 'Uttar Pradesh', type: 'city' as const, population: 1198491 },
    { city: 'Meerut', state: 'Uttar Pradesh', type: 'city' as const, population: 1305429 },
    { city: 'Allahabad', state: 'Uttar Pradesh', type: 'city' as const, population: 1216719 },
    { city: 'Bareilly', state: 'Uttar Pradesh', type: 'city' as const, population: 903668 },
    { city: 'Aligarh', state: 'Uttar Pradesh', type: 'city' as const, population: 874408 },
    { city: 'Moradabad', state: 'Uttar Pradesh', type: 'city' as const, population: 889810 },
    { city: 'Noida', state: 'Uttar Pradesh', type: 'city' as const, population: 637272 },
    { city: 'Greater Noida', state: 'Uttar Pradesh', type: 'city' as const, population: 107676 },
    { city: 'Saharanpur', state: 'Uttar Pradesh', type: 'city' as const, population: 705478 },
    { city: 'Gorakhpur', state: 'Uttar Pradesh', type: 'city' as const, population: 671048 },

    // Uttarakhand
    { city: 'Dehradun', state: 'Uttarakhand', type: 'city' as const, population: 569578 },
    { city: 'Haridwar', state: 'Uttarakhand', type: 'city' as const, population: 228832 },
    { city: 'Roorkee', state: 'Uttarakhand', type: 'city' as const, population: 118800 },
    { city: 'Haldwani', state: 'Uttarakhand', type: 'city' as const, population: 156060 },
    { city: 'Nainital', state: 'Uttarakhand', type: 'town' as const, population: 41377 },
    { city: 'Mussoorie', state: 'Uttarakhand', type: 'town' as const, population: 30118 },
    { city: 'Rishikesh', state: 'Uttarakhand', type: 'town' as const, population: 102138 },

    // West Bengal
    { city: 'Kolkata', state: 'West Bengal', type: 'city' as const, population: 4496694 },
    { city: 'Asansol', state: 'West Bengal', type: 'city' as const, population: 563917 },
    { city: 'Siliguri', state: 'West Bengal', type: 'city' as const, population: 513264 },
    { city: 'Durgapur', state: 'West Bengal', type: 'city' as const, population: 581409 },
    { city: 'Howrah', state: 'West Bengal', type: 'city' as const, population: 1077075 },
    { city: 'Darjeeling', state: 'West Bengal', type: 'town' as const, population: 118805 },
    // Kolkata Localities
    { city: 'Salt Lake', state: 'Kolkata, West Bengal', type: 'locality' as const, population: 250000 },
    { city: 'Park Street', state: 'Kolkata, West Bengal', type: 'locality' as const, population: 50000 },

    // Delhi NCR
    { city: 'New Delhi', state: 'Delhi', type: 'city' as const, population: 16787941 },
    { city: 'South Delhi', state: 'Delhi', type: 'locality' as const, population: 2731000 },
    { city: 'North Delhi', state: 'Delhi', type: 'locality' as const, population: 887978 },
    { city: 'East Delhi', state: 'Delhi', type: 'locality' as const, population: 1709346 },
    { city: 'West Delhi', state: 'Delhi', type: 'locality' as const, population: 2543243 },
    { city: 'Central Delhi', state: 'Delhi', type: 'locality' as const, population: 644005 },
    { city: 'Connaught Place', state: 'Delhi', type: 'locality' as const, population: 50000 },
    { city: 'Dwarka', state: 'Delhi', type: 'locality' as const, population: 220000 },
    { city: 'Rohini', state: 'Delhi', type: 'locality' as const, population: 500000 },
    { city: 'Pitampura', state: 'Delhi', type: 'locality' as const, population: 300000 },
    { city: 'Sarita Vihar', state: 'Delhi', type: 'locality' as const, population: 50000 },
    { city: 'Saket', state: 'Delhi', type: 'locality' as const, population: 80000 },
    { city: 'Vasant Kunj', state: 'Delhi', type: 'locality' as const, population: 100000 },
    { city: 'Hauz Khas', state: 'Delhi', type: 'locality' as const, population: 70000 },
    { city: 'Lajpat Nagar', state: 'Delhi', type: 'locality' as const, population: 90000 },
    { city: 'Greater Kailash', state: 'Delhi', type: 'locality' as const, population: 110000 },

    // Union Territories
    { city: 'Chandigarh', state: 'Chandigarh', type: 'city' as const, population: 1055450 },
    { city: 'Puducherry', state: 'Puducherry', type: 'city' as const, population: 244377 },
    { city: 'Port Blair', state: 'Andaman and Nicobar', type: 'city' as const, population: 112050 },
    { city: 'Leh', state: 'Ladakh', type: 'town' as const, population: 30870 },
    { city: 'Kargil', state: 'Ladakh', type: 'town' as const, population: 15000 },
];

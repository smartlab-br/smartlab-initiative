import axios from 'axios'

class GeoIpClient  {

        constructor (){ }

        static getClientGeo(callback) {

            let errorObj = {status: "fail", message: "Não foi possível identificar localização."};

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function(position){
                        const lng = position.coords.longitude;
                        const lat = position.coords.latitude;
                
                        // console.log(`longitude: ${ lng } | latitude: ${ lat }`);
            
                        var ajaxCall = {
                            method: "GET",
                            //"url": "http://ip-api.com/json/?fields=country,region,city,lat,lon,isp,query,status,message",
                            "url": "https://nominatim.openstreetmap.org/reverse?lat="+lat+"&lon="+lng+"&format=json&accept-language=pt-br",
                            headers: {}
                        };
                        axios(ajaxCall)
                        .then(
                            result => {
                                //console.log(result.data);
                                callback(result.data.address)
                            },
                            error => {
                                callback(errorObj);
                            }
                        )
                        .catch(function (error) {
                            // handle error
                            callback(errorObj);
                        });
            
                    }, 
                    function (err){
                        console.log(err);
                        callback(errorObj);
                    }                
                );
            } else {
                this.callback(errorObj);
            }
        }

  }

export default GeoIpClient;

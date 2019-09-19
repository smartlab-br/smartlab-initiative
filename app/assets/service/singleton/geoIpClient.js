import axios from 'axios'

class GeoIpClient  {

        constructor (callback){ 
            this.callback = callback;            
        }

        getClientGeo() {
            
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.displayLocationInfo, this.errorLocationInfo);
            } else {
                let errorObj = {status: "fail", message: "Não foi possível identificar localização."};
                this.callback(errorObj);
            }
        }

        errorLocationInfo (err){
            console.log(err);
            let errorObj = {status: "fail", message: "Não foi possível identificar localização."};
            this.callback(errorObj);
        }

        displayLocationInfo(position) {
            const lng = position.coords.longitude;
            const lat = position.coords.latitude;
    
            // console.log(`longitude: ${ lng } | latitude: ${ lat }`);

            var ajaxCall = {
                method: "GET",
                //"url": "http://ip-api.com/json/?fields=country,region,city,lat,lon,isp,query,status,message",
                "url": "https://nominatim.openstreetmap.org/reverse?lat="+lat+"&lon="+lng+"&format=json&accept-language=pt-br",
                headers: {}
            };
            let callback = this.callback;
            axios(ajaxCall)
            .then(
                result => {
                    //console.log(result.data);
                    callback(result.data.address)
                },
                error => {
                    var errorObj = {status: "fail", message: "Não foi possível identificar localização."};
                    callback(errorObj);
                }
            )
            .catch(function (error) {
                // handle error
                var errorObj = {status: "fail", message: "Não foi possível identificar localização."};
                callback(errorObj);
            });

        }
  }

export default GeoIpClient;

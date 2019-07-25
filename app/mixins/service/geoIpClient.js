import axios from 'axios'

const GeoIpClient = {
    install(Vue, options) {
      Vue.mixin({
        data () {
            return {
                callback: null
            }
        },
        methods: {
            getClientGeo(callback) {
                this.callback = callback;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(this.displayLocationInfo, this.errorLocationInfo);
                } else {
                    let errorObj = {status: "fail", message: "Não foi possível identificar localização."};
                    callback(errorObj);
                }
            },
            errorLocationInfo (err){
                console.log(err);
                let errorObj = {status: "fail", message: "Não foi possível identificar localização."};
                this.callback(errorObj);
            },
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
                
                axios(ajaxCall)
                .then(
                    result => {
                        //console.log(result.data);
                        this.callback(result.data.address)
                    },
                    error => {
                        var errorObj = {status: "fail", message: "Não foi possível identificar localização."};
                        this.callback(errorObj);
                    }
                )
                .catch(function (error) {
                    // handle error
                    var errorObj = {status: "fail", message: "Não foi possível identificar localização."};
                    this.callback(errorObj);
                });

            },
        }
      })
    }
  }

export default GeoIpClient;

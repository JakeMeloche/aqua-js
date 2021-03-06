import axios from 'axios';
import https from 'https'



class Aqua{

  constructor({userId, password, host, port = 443, useTLS = true, verifyTLS = false, apiVersion = 'v1', remember = true, token = ''}){
    this.userId = userId;
    this.host = host;
    this.port = port;
    this.useTLS = useTLS;
    this.verifyTLS = verifyTLS;
    this.apiVersion = apiVersion;
    this.remember = remember;
    this.token = token;
    this.baseURL = `http${useTLS ? 's' : ''}://${host}:${port}/api`
    this.config = { headers: {'Content-Type': 'application/json'}};
    this.password = password;

    if(token != ''){
     this.config.headers = {...this.config.headers, 'Authorization': `Bearer ${this.token}` }
    }


    this._axiosInstance = axios.create({
      baseURL: this.baseURL,
      responseType: "json",
      httpsAgent: new https.Agent({  
        rejectUnauthorized: this.verifyTLS
      }),
    })


  }


    async init(){
        await this._axiosInstance.post('/v1/login', {
            id: this.userId,
            password: this.password,
            remember: this.remember
          })
          .then(response => response.data)
          .then(data => {
            this.token = data.token
            this.config.headers =  {...this.config.headers, 'Authorization': `Bearer ${this.token}` }
          })
          .catch((error) => {
            console.log(error.response.data);
          });
          this.password = ""
    };


    async containers({nodeId = "", groupBy = 'containers', status = 'running', page = '1', pageSize = '50'}){
      let containers = []
      let params = {
        nodeId: nodeId,
        groupBy: groupBy,
        status: status,
        page: page,
        pageSize: pageSize
      }

      await this._axiosInstance.get('/v1/containers', {...this.config, params} )
      .then(response => {
        containers = response.data
      })
      .catch( error => {
        console.log(error.response.data)
      });

      return containers

    }



    async listRegisteredImages({registry = null, repository = null, name = null, page = 1, pageSize = 50, orderBy = null}){
        let registeredImages = []
        let params = { 
          registry:registry, 
          repository:repository, 
          name:name, 
          page:page, 
          page_size: 
          pageSize, 
          order_by: orderBy }

        await this._axiosInstance.get('/v2/images', {...this.config, params})
        .then(response => {
          registeredImages = response.data
        })
        .catch( error => {
          console.log(error.response.data)
        });

        return registeredImages

    }


    async listRegistries() {
      let registries = []
      await this._axiosInstance.get('/v1/registries', this.config)
        .then(response => response.data)
        .then( data => {
          registries = data
        })
        .catch((error) => {
          console.log(error.response.data);
        });

        return registries;
    }

    //List all vulnerabilities found in images
    async vulnerabilities({show_negligible = true, hide_base_image = false, text_search = null, 
                             severity = null, order_by = null, page = 1, pagesize = 100, include_vpatch_info = true,
                            image_name = null, fix_availability = true, acknowledge_status = false}) {
      let vulns = {}
      let params = {
        show_negligible: show_negligible, 
        hide_base_image: hide_base_image, 
        text_search: text_search, 
        severity: severity, 
        order_by: order_by, 
        page: page, 
        pagesize: pagesize, 
        include_vpatch_info: include_vpatch_info,
        image_name: image_name, 
        fix_availability: fix_availability, 
        acknowledge_status: acknowledge_status
      }

      await this._axiosInstance.get('/v2/risks/vulnerabilities', {...this.config, params})
        .then(response => response.data)
        .then( data => {
          vulns = data
        })
        .catch((error) => {
          console.log(error.response.data);
        });

        return vulns;
    }


    async dashboard({registry =  null, hosts = null, containers_app = null}) {
      let results = []
      let params = { registry: registry, hosts: hosts, containers_app: containers_app }

      await this._axiosInstance.get('/v1/dashboard', {...this.config, params})
        .then(response => response.data)
        .then( data => {
          results = data
        })
        .catch((error) => {
          console.log(error.response.data);
        });

        return results;
    }
    
    async infrastructure({type = 'clusters', search = null, enforced = null, scope = 'Global', orderBy = 'name', page = '1', pageSize = '50'}){

      let results = []

      let params = {
        page,
        page_size: pageSize,
        order_by: orderBy,
        search,
        type,
        enforced,
        scope
      }

      await this._axiosInstance.get('/v2/infrastructure', {...this.config, params})
        .then(response => response.data)
        .then( data => {
          results = data
        })
        .catch((error) => {
          console.log(error.response.data);
        });

        return results;
    
    }

    async services({page = '1', pageSize = '50'}){
      let results = []

      let params = {
        page,
        page_size: pageSize,
      }

      await this._axiosInstance.get('/v1/applications', {...this.config, params})
      .then(response => response.data )
      .then( data => {
        results = data
      })
      .catch((error) => {
        console.log(error.response.data);
      });

      return results
    }

    async getService(name){
      let results = []

      await this._axiosInstance.get(`/v1/applications/${name}`, this.config)
      .then(response => response.data )
      .then( data => {
        results = data
      })
      .catch((error) => {
        console.log(error.response.data);
      });

      return results
    }


}// end Aqua class

 

export default Aqua;
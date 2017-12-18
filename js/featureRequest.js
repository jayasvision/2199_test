
// The featureRequestViewModel holds the properties related to Feature Request Form.

var featureRequestViewModel = function () {
    var self = this;

    var url = window.location.href.split('/');
    var relativeUrl = url[0] + '//' + url[2] + '/';

    self.baseUrl = "http://54.210.117.115";
    self.createPageUrl = relativeUrl + "featureRequest.html";
    self.indexPageUrl = relativeUrl + "index.html";
    self.showLoader = ko.observable(false);
    self.priorites1 = [];
    self.clients1 = [];
    self.productAreas1 = [];

    self.featureModel = {
        id: ko.observable(),
        title: ko.observable(''),
        description: ko.observable(),
        client: ko.observable(""),
        clientPriority: ko.observable(),
        clients: ko.observableArray([]),//['ClientA', 'ClientB', 'ClientC']
        targetDate: ko.observable(),
        productArea: ko.observable(),
        productAreas: ko.observableArray([]), //['Policies', "Billing", "Claims", "Reports"]
        priorities: ko.observableArray([]),
        clientLink: ko.observable(),
        clientPriorityLink: ko.observable(),
        productAreaLink: ko.observable()
    }


    //Holds data to show in feature table.
    self.features = ko.observableArray([]);

    //For Page Size
    self.pageSize = [10, 20, 30, 40, 50];
    self.selectedPageSize = ko.observable();

    //Search
    self.searchField = ko.observable();


    self.getPriorities = function () {

        let priorites = [];
        $.getJSON(self.baseUrl + "/priorities", function (data) {
            if (data !== undefined && data.data.length > 0) {
                for (let i = 0; i < data.data.length; i++) {
                    let priority = {
                        priority: data.data[i].attributes.priority,
                        id: data.data[i].id
                    }
                    priorites.push(priority);
                    self.priorites1.push(priority);
                }
                
                ko.mapping.fromJS(priorites, {}, self.featureModel.priorities);
            }
        });
    }

    self.getClients = function () {

        let clients = [];
        $.getJSON(self.baseUrl + "/clients", function (data) {
            if (data !== undefined && data.data.length > 0) {
                for (let i = 0; i < data.data.length; i++) {
                    let client = {
                        name: data.data[i].attributes.name,
                        id: data.data[i].id
                    }
                    clients.push(client);
                    self.clients1.push(client);
                }
               
                ko.mapping.fromJS(clients, {}, self.featureModel.clients);
            }
        });
    }

    self.getProductAreas = function () {

        let productAreas = [];
        $.getJSON(self.baseUrl + "/product_areas", function (data) {
            if (data !== undefined && data.data.length > 0) {
                for (let i = 0; i < data.data.length; i++) {                    
                    let productArea = {
                        product_Area: data.data[i].attributes.name,
                        id: data.data[i].id
                    }
                    
                    productAreas.push(productArea);
                    self.productAreas1.push(productArea);
                }
               
                ko.mapping.fromJS(productAreas, {}, self.featureModel.productAreas);
            }
        });
    }

    self.addFeature = function () {
        debugger;
        self.showLoader(true);
        let clientId = self.featureModel.client();
        let priorityId = self.featureModel.clientPriority();
        let productAreaId = self.featureModel.productArea();
        let id = self.featureModel.id();

        let featureObj = {
            data: {
                type: "feature_request",
                id: id,
                attributes: {
                    id: self.featureModel.id(),
                    title: self.featureModel.title(),
                    description: self.featureModel.description(),
                    target_date: self.featureModel.targetDate()
                },
                relationships: {
                    client: {
                        data: {
                            type: "client",
                            id: clientId
                        }
                    },
                    client_priority: {
                        data: {
                            type: "priority",
                            id: priorityId
                        }
                    },
                    product_area: {
                        data: {
                            type: "product_area",
                            id: productAreaId
                        }
                    }
                }
            }
        }
       

      
        let postUpdateUrl = id === undefined ? self.baseUrl + "/feature_requests" : self.baseUrl + "/feature_requests/" + id

        $.ajax({            type: id === undefined ? 'POST' : 'PATCH',            async: false,            url: postUpdateUrl,            contentType: "application/json; charset=utf-8",            dataType: "json",            crossDomain: true,            data: JSON.stringify(featureObj),            success: function (data) {                self.showLoader(false);                alert('Feature Request saved successfully.')                window.location.href = "listing.html";            },            error: function (data) {                self.showLoader(false);                alert('Something went wrong!! Please try once again.')                //window.location.href = self.indexPageUrl;            }
        });

        self.showLoader(false);

        //if (self.featureModel.id() !== undefined && self.featureModel.id() != 0) {
        //    console.log(queryData);
        //    self.showLoader(false);
        //    $.post(self.baseUrl + "/feature_requests/" + self.featureModel.id(), queryData, function (returnedData) {
        //        window.location.href = self.indexPageUrl;
        //    })
        //}
        //else {
        //    console.log(queryData);
        //    self.showLoader(false);
        //    $.post(self.baseUrl + "/feature_requests", queryData, function (returnedData) {
        //        window.location.href = self.indexPageUrl;
        //    })
        //}
    }

    self.getFeatures = function () {

        self.showLoader(true);
        let url = self.baseUrl + "/feature_requests";
        let productAreaUrl = self.baseUrl;
        let clientUrl = self.baseUrl;
        let clientPriorityUrl = self.baseUrl;

        let tempFeatureRequests = [];
        $.getJSON(url, function (data) {
            let tempData = data.data;

            if (tempData !== undefined && tempData.length > 0) {
                for (let i = 0; i < tempData.length; i++) {
                    let tempFeatureRequest = {
                        title: tempData[i].attributes.title,
                        id: tempData[i].id,
                        description: tempData[i].attributes.description,
                        targetDate: tempData[i].attributes.target_date,

                        client: tempData[i].relationships.client.links.self,
                        clientPriority: tempData[i].relationships.client_priority.links.self,
                        productArea: tempData[i].relationships.product_area.links.self
                    }
                    tempFeatureRequests.push(tempFeatureRequest);
                }
            }
            var pagedFeatureRequests = tempFeatureRequests.slice(0, self.selectedPageSize())

            self.showLoader(false);
            pagedFeatureRequests.forEach(function (item, i, sourceArray) {

                try {

                    let clientlink = item.client;
                    let clientLinkSplit = clientlink.split('/');
                    let clientId = clientLinkSplit[clientLinkSplit.length - 1];
                    let displayClient = self.clients1.filter(c => c.id === clientId)
                    if (displayClient !== null && displayClient[0] != null)
                        pagedFeatureRequests[i].client = displayClient[0].name;

                    let priorityLink = item.clientPriority;
                    let priorityLinkSplit = priorityLink.split('/');
                    let priorityId = priorityLinkSplit[priorityLinkSplit.length - 1];
                    let displayPriority = self.priorites1.filter(c => c.id === priorityId)
                    if (displayPriority !== null && displayPriority[0] != null)
                        pagedFeatureRequests[i].clientPriority = displayPriority[0].priority;

                    let productAreaLink = item.productArea;
                    let productAreaSplit = productAreaLink.split('/');
                    let productAreaId = productAreaSplit[productAreaSplit.length - 1];
                    let displayProductArea = self.productAreas1.filter(c => c.id == productAreaId)
                    if (displayProductArea !== null && displayProductArea[0] != null)
                        pagedFeatureRequests[i].productArea = displayProductArea[0].product_Area;
                } catch (e) {

                }

            })

            if (self.searchField() !== undefined) {
                let searchText = self.searchField().toLowerCase();
                pagedFeatureRequests = pagedFeatureRequests.filter(function (el) {
                    return (el.client.toLowerCase().indexOf(searchText) > -1 || el.title.toLowerCase().indexOf(searchText) > -1
                        || el.description.toLowerCase().indexOf(searchText) > -1
                        || el.productArea.toLowerCase().indexOf(searchText) > -1 || el.targetDate.toLowerCase().indexOf(searchText) > -1)
                });
            }

            var observableData = ko.mapping.fromJS(pagedFeatureRequests);
            ko.mapping.fromJS(pagedFeatureRequests, {}, self.features);

        })

    }

    self.getFeatureById = function (id) {
        self.showLoader(true);
        let featureRequestByIdUrl = "http://54.210.117.115/feature_requests/" + id;

        $.getJSON(featureRequestByIdUrl, function (data) {
            if (data !== undefined && data.data !== undefined) {

                let clientlink = data.data.relationships.client.links.self;
                let clientLinkSplit = clientlink.split('/');
                let clientId = clientLinkSplit[clientLinkSplit.length - 1];

                let priorityLink = data.data.relationships.client_priority.links.self;
                let priorityLinkSplit = priorityLink.split('/');
                let priorityId = priorityLinkSplit[priorityLinkSplit.length - 1];

                let productAreaLink = data.data.relationships.product_area.links.self;
                let productAreaSplit = productAreaLink.split('/');
                let productAreaId = productAreaSplit[productAreaSplit.length - 1];

                self.featureModel.title(data.data.attributes.title);
                self.featureModel.id(data.data.id);
                self.featureModel.description(data.data.attributes.description);
                self.featureModel.client(clientId);
                self.featureModel.clientPriority(priorityId);
                self.featureModel.targetDate(data.data.attributes.target_date);
                self.featureModel.productArea(productAreaId);
            }
        });

        self.showLoader(false);
    }

    self.getTargetDate = function (targetDate1) {
        let targetDate = targetDate1.split('/');
        let date = new Date(targetDate[2], targetDate[1] - 1, targetDate[0]);

        // GET YYYY, MM AND DD FROM THE DATE OBJECT
        var yyyy = date.getFullYear().toString();
        var mm = (date.getMonth() + 1).toString();
        var dd = date.getDate().toString();

        // CONVERT mm AND dd INTO chars
        var mmChars = mm.split('');
        var ddChars = dd.split('');

        // CONCAT THE STRINGS IN YYYY-MM-DD FORMAT
        var datestring = yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
        return datestring;
    }

    self.navigateToCreateRequest = function () {
        window.location.href = self.createPageUrl;
    }

    self.cancel = function () {
        window.location.href = "listing.html";
    }

    self.navigateToEdit = function (item) {
        window.location.href = "form.html?id=" + item.id();
    }

    self.pageSizeChange = function () {
        self.getFeatures();
    }

    self.searchFeatures = function (d, e) {
        if (e.keyCode === 13) {
            self.getFeatures();
        }
    }

    self.searchFeatureRequests = function () {
        self.getFeatures();
    }

    self.deleteFeature = function (id) {
        alert(id)
    }

    self.getQueryStrings = function () {
        var assoc = {};
        var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
        var queryString = location.search.substring(1);
        var keyValues = queryString.split('&');

        for (var i in keyValues) {
            var key = keyValues[i].split('=');
            if (key.length > 1) {
                assoc[decode(key[0])] = decode(key[1]);
            }
        }
        return assoc;
    }

};



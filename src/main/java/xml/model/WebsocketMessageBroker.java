package xml.model;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElements;
import javax.xml.bind.annotation.XmlRootElement;
import java.util.ArrayList;
import java.util.List;

@XmlRootElement(name="websocket-message-broker")
public class WebsocketMessageBroker {
    private String applicationDestinationPrefix;
    private WebsocketStompEndPoint websocketStompEndPoint;
    private List<WebsocketSimpleBroker> WebsocketSimpleBrokers  = new ArrayList<>();

    @XmlElements(@XmlElement(name="websocket-simple-broker"))
    public List<WebsocketSimpleBroker> getWebsocketSimpleBrokers() {
        return WebsocketSimpleBrokers;
    }

    public void setWebsocketSimpleBrokers(List<WebsocketSimpleBroker> websocketSimpleBrokers) {
        WebsocketSimpleBrokers = websocketSimpleBrokers;
    }

    @XmlElement(name="websocket-stomp-endpoint")
    public WebsocketStompEndPoint getWebsocketStompEndPoint() {
        return websocketStompEndPoint;
    }

    public void setWebsocketStompEndPoint(WebsocketStompEndPoint websocketStompEndPoint) {
        this.websocketStompEndPoint = websocketStompEndPoint;
    }

    @XmlAttribute(name="application-destination-prefix")
    public String getApplicationDestinationPrefix() {
        return applicationDestinationPrefix;
    }
    public void setApplicationDestinationPrefix(String applicationDestinationPrefix) {
        this.applicationDestinationPrefix = applicationDestinationPrefix;
    }
}

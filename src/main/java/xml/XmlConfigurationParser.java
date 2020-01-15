package xml;
import xml.model.WebsocketMessageBroker;
import xml.model.WebsocketSimpleBroker;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class XmlConfigurationParser {
    WebsocketMessageBroker WebsocketMessageBrokerConfig;

    public XmlConfigurationParser(String path) throws JAXBException {
        File xmlFile = new File(path);
        JAXBContext jaxbContext = JAXBContext.newInstance(WebsocketMessageBroker.class);
        Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
        WebsocketMessageBrokerConfig = (WebsocketMessageBroker) jaxbUnmarshaller.unmarshal(xmlFile);

    }

    public String getMessageBrokerApplicationDestinationPrefix() {
        return WebsocketMessageBrokerConfig.getApplicationDestinationPrefix();
    }

    public String getStompEndPointPath() {
        return WebsocketMessageBrokerConfig.getWebsocketStompEndPoint().getPath();
    }

    public List<String> getSimpleBrokerPrefixs() {
        List<String> prefixs = new ArrayList<>();
        for (WebsocketSimpleBroker websocketSimpleBroker : WebsocketMessageBrokerConfig.getWebsocketSimpleBrokers())
            prefixs.add(websocketSimpleBroker.getPrefix());
        return prefixs;
    }
}

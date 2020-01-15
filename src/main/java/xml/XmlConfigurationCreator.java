package xml;

import xml.model.WebsocketMessageBroker;
import xml.model.WebsocketSimpleBroker;
import xml.model.WebsocketStompEndPoint;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class XmlConfigurationCreator <T>{
    /*WebsocketMessageBroker broker = new WebsocketMessageBroker();
    WebsocketStompEndPoint stompEndPoint = new WebsocketStompEndPoint();
    List<WebsocketSimpleBroker> simpleBroker = new ArrayList<>();
    WebsocketSimpleBroker broker1 = new WebsocketSimpleBroker();
    WebsocketSimpleBroker broker2 = new WebsocketSimpleBroker();
        broker1.setPrefix("/channel");
        broker2.setPrefix("/game");
        simpleBroker.add(broker1);
        simpleBroker.add(broker2);
        stompEndPoint.setPath("/ws");
        broker.setApplicationDestinationPrefix("/app");
        broker.setWebsocketStompEndPoint(stompEndPoint);
        broker.setWebsocketSimpleBrokers(simpleBroker);*/

     public void createXml(String path, String nameFile, T toXml) throws JAXBException {
         JAXBContext jaxbContext = JAXBContext.newInstance((Class) toXml);
         Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
         jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
         jaxbMarshaller.marshal(toXml, new File(path + "/" + nameFile));
     }
}

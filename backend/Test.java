import java.util.Base64;
public class Test {
    public static void main(String[] args) {
        try {
            String token = "YzI0YzFhM2YtNGRiOS00NTkzLWIxMWUtOWYzMzY5NzNhNTIxOmEwMmM4OGU5LWQ1NDUtNGU5NS1hZDBiLTAzYWI5YjdhODIwNw";
            byte[] decoded = Base64.getUrlDecoder().decode(token);
            System.out.println(new String(decoded));
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}

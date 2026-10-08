import org.springframework.security.crypto.bcrypt.BCrypt;
public class BCryptGen {
  public static void main(String[] args) {
    String password = "Admin123456!";
    System.out.println(BCrypt.hashpw(password, BCrypt.gensalt(12)));
  }
}

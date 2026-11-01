package local.governance.auth.crypto;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import org.springframework.stereotype.Component;

@Component
public class Passwords {

    public enum Verification {
        CURRENT,
        PREDECESSOR,
        FAILED
    }

    private static final int SALT_BYTES = 16;
    private static final int HASH_BYTES = 32;
    private static final int CURRENT_MEMORY_KIB = 65_536;
    private static final int CURRENT_ITERATIONS = 3;
    private static final int PREDECESSOR_MEMORY_KIB = 19_456;
    private static final int PREDECESSOR_ITERATIONS = 2;

    private final SecureRandom random = new SecureRandom();

    public String hash(String password) {
        byte[] salt = new byte[SALT_BYTES];
        random.nextBytes(salt);
        byte[] hash = derive(password, salt, CURRENT_MEMORY_KIB, CURRENT_ITERATIONS);
        Base64.Encoder encoder = Base64.getEncoder().withoutPadding();
        return "$argon2id$v=19$m=" + CURRENT_MEMORY_KIB + ",t=" + CURRENT_ITERATIONS + ",p=1$"
                + encoder.encodeToString(salt) + "$" + encoder.encodeToString(hash);
    }

    public Verification verify(String password, String encoded) {
        if (encoded == null || !encoded.startsWith("$argon2id$")) {
            return Verification.FAILED;
        }
        String[] parts = encoded.split("\\$");
        if (parts.length != 6 || !"v=19".equals(parts[2])) {
            return Verification.FAILED;
        }
        int memory;
        int iterations;
        int lanes;
        try {
            String[] params = parts[3].split(",");
            memory = Integer.parseInt(params[0].substring(2));
            iterations = Integer.parseInt(params[1].substring(2));
            lanes = Integer.parseInt(params[2].substring(2));
        } catch (RuntimeException exception) {
            return Verification.FAILED;
        }
        if (lanes != 1) {
            return Verification.FAILED;
        }
        boolean current = memory == CURRENT_MEMORY_KIB && iterations == CURRENT_ITERATIONS;
        boolean predecessor = memory == PREDECESSOR_MEMORY_KIB && iterations == PREDECESSOR_ITERATIONS;
        if (!current && !predecessor) {
            return Verification.FAILED;
        }
        Base64.Decoder decoder = Base64.getDecoder();
        byte[] salt;
        byte[] expected;
        try {
            salt = decoder.decode(parts[4]);
            expected = decoder.decode(parts[5]);
        } catch (IllegalArgumentException exception) {
            return Verification.FAILED;
        }
        byte[] actual = derive(password, salt, memory, iterations);
        if (!MessageDigest.isEqual(expected, actual)) {
            return Verification.FAILED;
        }
        return current ? Verification.CURRENT : Verification.PREDECESSOR;
    }

    private byte[] derive(String password, byte[] salt, int memoryKib, int iterations) {
        Argon2Parameters parameters = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                .withMemoryAsKB(memoryKib)
                .withIterations(iterations)
                .withParallelism(1)
                .withSalt(salt)
                .build();
        Argon2BytesGenerator generator = new Argon2BytesGenerator();
        generator.init(parameters);
        byte[] output = new byte[HASH_BYTES];
        generator.generateBytes(password.getBytes(StandardCharsets.UTF_8), output);
        return output;
    }
}
